import { describe, it, expect, jest, beforeEach } from '@jest/globals';
import TicketService from '../src/pairtest/TicketService.js';
import TicketTypeRequest from '../src/pairtest/lib/TicketTypeRequest.js';
import InvalidPurchaseException from '../src/pairtest/lib/InvalidPurchaseException.js';
import TicketPaymentService from '../src/thirdparty/paymentgateway/TicketPaymentService.js';
import SeatReservationService from '../src/thirdparty/seatbooking/SeatReservationService.js';

describe('TicketService', () => {
  let ticketService;
  let mockPaymentService;
  let mockSeatReservationService;

  beforeEach(() => {
    mockPaymentService = { makePayment: jest.fn() };
    mockSeatReservationService = { reserveSeat: jest.fn() };
    ticketService = new TicketService(mockPaymentService, mockSeatReservationService);
  });

  it('should be defined', () => {
    expect(ticketService).toBeDefined();
  });

  it('should have a purchaseTickets method', () => {
    expect(typeof ticketService.purchaseTickets).toBe('function');
  });
});
