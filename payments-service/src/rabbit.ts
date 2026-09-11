import {connect} from 'amqplib';
import type {Channel, ChannelModel} from 'amqplib';

const URL = process.env.RABBITMQ_URL ?? 'amqp://localhost';
const FILE = 'payment.created';

let canal: Channel | undefined;

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

export async function connecterRabbit(): Promise<void> {
  const connexion = await connecterAvecReessai();
  canal = await connexion.createChannel();
  // durable: la file survit a un redemarrage du broker
  await canal.assertQueue(FILE, {durable: true});
  console.log(`RabbitMQ connecte, file "${FILE}" prete`);
}

export function publierPaiement(message: object): void {
  if (!canal) {
    console.warn('RabbitMQ non connecte, message non publie');
    return;
  }
  // persistent: le message est ecrit sur disque, il survit lui aussi
  canal.sendToQueue(FILE, Buffer.from(JSON.stringify(message)), {
    persistent: true,
  });
  console.log(`Publie : ${JSON.stringify(message)}`);
}
