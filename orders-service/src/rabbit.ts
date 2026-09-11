import {connect} from 'amqplib';
import type {ChannelModel} from 'amqplib';
import {OrderRepository} from './repositories';

const URL = process.env.RABBITMQ_URL ?? 'amqp://localhost';
const FILE = 'payment.created';

/**
 * RabbitMQ met une dizaine de secondes a demarrer : on reessaie au lieu de
 * planter au premier refus de connexion.
 */
async function connecterAvecReessai(essais = 10): Promise<ChannelModel> {
  for (let i = 1; i <= essais; i++) {
    try {
      return await connect(URL);
    } catch {
      console.log(`RabbitMQ indisponible (${i}/${essais}), nouvel essai dans 3s`);
      await new Promise(r => setTimeout(r, 3000));
    }
  }
  throw new Error('Impossible de joindre RabbitMQ');
}

export async function ecouterPaiements(repo: OrderRepository): Promise<void> {
  const connexion = await connecterAvecReessai();
  const canal = await connexion.createChannel();
  await canal.assertQueue(FILE, {durable: true});

  await canal.consume(FILE, async msg => {
    if (!msg) return;
    try {
      const {orderId} = JSON.parse(msg.content.toString());
      await repo.updateById(orderId, {status: 'paid'});
      console.log(`Commande ${orderId} passee a "paid"`);
      // ack: le message est retire de la file. Sans lui, il reviendrait.
      canal.ack(msg);
    } catch (err) {
      console.error('Message rejete :', (err as Error).message);
      // requeue: false, sinon un message invalide boucle indefiniment
      canal.nack(msg, false, false);
    }
  });

  console.log(`En ecoute sur la file "${FILE}"`);
}
