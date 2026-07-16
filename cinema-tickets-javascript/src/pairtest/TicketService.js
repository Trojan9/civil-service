import TicketTypeRequest from './lib/TicketTypeRequest.js';
import InvalidPurchaseException from './lib/InvalidPurchaseException.js';
import TicketPaymentService from '../thirdparty/paymentgateway/TicketPaymentService.js';
import SeatReservationService from '../thirdparty/seatbooking/SeatReservationService.js';

export default class TicketService {
  #paymentService;
  #seatReservationService;

  #TICKET_PRICES = {
    ADULT: 25,
    CHILD: 15,
    INFANT: 0,
  };

  #MAX_TICKETS = 25;

  constructor(
    paymentService = new TicketPaymentService(),
    seatReservationService = new SeatReservationService(),
  ) {
    this.#paymentService = paymentService;
    this.#seatReservationService = seatReservationService;
  }

  /**
   * Should only have private methods other than the one below.
   */

  purchaseTickets(accountId, ...ticketTypeRequests) {
    this.#validateAccountId(accountId);
    this.#validateTicketRequests(ticketTypeRequests);
    this.#validateBusinessRules(ticketTypeRequests);
  }

  #validateAccountId(accountId) {
    if (!Number.isInteger(accountId) || accountId <= 0) {
      throw new InvalidPurchaseException('Account ID must be a positive integer');
    }
  }

  #validateTicketRequests(ticketTypeRequests) {
    if (!ticketTypeRequests || ticketTypeRequests.length === 0) {
      throw new InvalidPurchaseException('At least one ticket request is required');
    }

    const totalTickets = ticketTypeRequests.reduce(
      (sum, request) => sum + request.getNoOfTickets(),
      0,
    );

    if (totalTickets === 0) {
      throw new InvalidPurchaseException('Total number of tickets must be greater than zero');
    }

    if (totalTickets > this.#MAX_TICKETS) {
      throw new InvalidPurchaseException(
        `Cannot purchase more than ${this.#MAX_TICKETS} tickets at a time`,
      );
    }
  }

  #validateBusinessRules(ticketTypeRequests) {
    const ticketCounts = this.#countTicketsByType(ticketTypeRequests);

    if (ticketCounts.ADULT === 0 && (ticketCounts.CHILD > 0 || ticketCounts.INFANT > 0)) {
      throw new InvalidPurchaseException(
        'Child and Infant tickets cannot be purchased without an Adult ticket',
      );
    }

    if (ticketCounts.INFANT > ticketCounts.ADULT) {
      throw new InvalidPurchaseException(
        'Number of Infant tickets cannot exceed the number of Adult tickets',
      );
    }
  }

  #countTicketsByType(ticketTypeRequests) {
    return ticketTypeRequests.reduce(
      (counts, request) => {
        counts[request.getTicketType()] += request.getNoOfTickets();
        return counts;
      },
      { ADULT: 0, CHILD: 0, INFANT: 0 },
    );
  }
}
