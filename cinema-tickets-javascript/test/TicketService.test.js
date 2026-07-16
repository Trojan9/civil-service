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

  describe('account validation', () => {
    it('should reject account ID of 0', () => {
      expect(() => ticketService.purchaseTickets(0)).toThrow(InvalidPurchaseException);
    });

    it('should reject negative account ID', () => {
      expect(() => ticketService.purchaseTickets(-1)).toThrow(InvalidPurchaseException);
    });

    it('should reject non-integer account ID', () => {
      expect(() => ticketService.purchaseTickets(1.5)).toThrow(InvalidPurchaseException);
    });

    it('should reject null account ID', () => {
      expect(() => ticketService.purchaseTickets(null)).toThrow(InvalidPurchaseException);
    });

    it('should reject undefined account ID', () => {
      expect(() => ticketService.purchaseTickets(undefined)).toThrow(InvalidPurchaseException);
    });

    it('should reject string account ID', () => {
      expect(() => ticketService.purchaseTickets('abc')).toThrow(InvalidPurchaseException);
    });

    it('should accept valid account ID of 1', () => {
      expect(() => ticketService.purchaseTickets(1, new TicketTypeRequest('ADULT', 1))).not.toThrow();
    });

    it('should accept large valid account ID', () => {
      expect(() => ticketService.purchaseTickets(999999, new TicketTypeRequest('ADULT', 1))).not.toThrow();
    });
  });
});
