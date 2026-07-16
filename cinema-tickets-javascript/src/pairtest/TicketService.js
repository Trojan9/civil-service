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

  constructor(paymentService = new TicketPaymentService(), seatReservationService = new SeatReservationService()) {
    this.#paymentService = paymentService;
    this.#seatReservationService = seatReservationService;
  }

  /**
   * Should only have private methods other than the one below.
   */

  purchaseTickets(accountId, ...ticketTypeRequests) {
    this.#validateAccountId(accountId);
  }

  #validateAccountId(accountId) {
    if (!Number.isInteger(accountId) || accountId <= 0) {
      throw new InvalidPurchaseException('Account ID must be a positive integer');
    }
  }
}
