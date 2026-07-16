import TicketService from './src/pairtest/TicketService.js';
import TicketTypeRequest from './src/pairtest/lib/TicketTypeRequest.js';

const ticketService = new TicketService();

function demo(description, fn) {
  try {
    fn();
    console.log(`PASS: ${description}`);
  } catch (error) {
    console.log(`REJECTED: ${description} --> ${error.message}`);
  }
}

console.log('=== Valid Purchases ===\n');

demo('1 Adult ticket (£25, 1 seat)', () => {
  ticketService.purchaseTickets(1, new TicketTypeRequest('ADULT', 1));
});

demo('2 Adults + 3 Children (£95, 5 seats)', () => {
  ticketService.purchaseTickets(
    1,
    new TicketTypeRequest('ADULT', 2),
    new TicketTypeRequest('CHILD', 3),
  );
});

demo('2 Adults + 2 Children + 1 Infant (£80, 4 seats)', () => {
  ticketService.purchaseTickets(
    1,
    new TicketTypeRequest('ADULT', 2),
    new TicketTypeRequest('CHILD', 2),
    new TicketTypeRequest('INFANT', 1),
  );
});

demo('25 Adult tickets - max allowed (£625, 25 seats)', () => {
  ticketService.purchaseTickets(1, new TicketTypeRequest('ADULT', 25));
});

console.log('\n=== Invalid Purchases ===\n');

demo('Account ID of 0', () => {
  ticketService.purchaseTickets(0, new TicketTypeRequest('ADULT', 1));
});

demo('Negative account ID', () => {
  ticketService.purchaseTickets(-1, new TicketTypeRequest('ADULT', 1));
});

demo('No ticket requests', () => {
  ticketService.purchaseTickets(1);
});

demo('26 tickets - exceeds max', () => {
  ticketService.purchaseTickets(1, new TicketTypeRequest('ADULT', 26));
});

demo('Child without Adult', () => {
  ticketService.purchaseTickets(1, new TicketTypeRequest('CHILD', 2));
});

demo('Infant without Adult', () => {
  ticketService.purchaseTickets(1, new TicketTypeRequest('INFANT', 1));
});

demo('More Infants than Adults', () => {
  ticketService.purchaseTickets(
    1,
    new TicketTypeRequest('ADULT', 1),
    new TicketTypeRequest('INFANT', 2),
  );
});

demo('Plain object instead of TicketTypeRequest', () => {
  ticketService.purchaseTickets(1, { type: 'ADULT', noOfTickets: 1 });
});
