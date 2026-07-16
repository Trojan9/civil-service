import { describe, it, expect, jest, beforeEach } from '@jest/globals';
import TicketService from '../src/pairtest/TicketService.js';
import TicketTypeRequest from '../src/pairtest/lib/TicketTypeRequest.js';
import InvalidPurchaseException from '../src/pairtest/lib/InvalidPurchaseException.js';

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
      expect(() =>
        ticketService.purchaseTickets(1, new TicketTypeRequest('ADULT', 1)),
      ).not.toThrow();
    });

    it('should accept large valid account ID', () => {
      expect(() =>
        ticketService.purchaseTickets(999999, new TicketTypeRequest('ADULT', 1)),
      ).not.toThrow();
    });
  });

  describe('ticket request validation', () => {
    it('should reject when no ticket requests are provided', () => {
      expect(() => ticketService.purchaseTickets(1)).toThrow(InvalidPurchaseException);
    });

    it('should reject when total tickets exceed 25', () => {
      expect(() => ticketService.purchaseTickets(1, new TicketTypeRequest('ADULT', 26))).toThrow(
        InvalidPurchaseException,
      );
    });

    it('should accept exactly 25 tickets', () => {
      expect(() =>
        ticketService.purchaseTickets(1, new TicketTypeRequest('ADULT', 25)),
      ).not.toThrow();
    });

    it('should reject when total tickets across multiple requests exceed 25', () => {
      expect(() =>
        ticketService.purchaseTickets(
          1,
          new TicketTypeRequest('ADULT', 20),
          new TicketTypeRequest('CHILD', 6),
        ),
      ).toThrow(InvalidPurchaseException);
    });

    it('should reject when zero tickets are requested', () => {
      expect(() => ticketService.purchaseTickets(1, new TicketTypeRequest('ADULT', 0))).toThrow(
        InvalidPurchaseException,
      );
    });
  });

  describe('business rule validation', () => {
    it('should reject Child tickets without an Adult ticket', () => {
      expect(() => ticketService.purchaseTickets(1, new TicketTypeRequest('CHILD', 2))).toThrow(
        InvalidPurchaseException,
      );
    });

    it('should reject Infant tickets without an Adult ticket', () => {
      expect(() => ticketService.purchaseTickets(1, new TicketTypeRequest('INFANT', 1))).toThrow(
        InvalidPurchaseException,
      );
    });

    it('should reject Child and Infant tickets without an Adult ticket', () => {
      expect(() =>
        ticketService.purchaseTickets(
          1,
          new TicketTypeRequest('CHILD', 1),
          new TicketTypeRequest('INFANT', 1),
        ),
      ).toThrow(InvalidPurchaseException);
    });

    it('should accept Child tickets with an Adult ticket', () => {
      expect(() =>
        ticketService.purchaseTickets(
          1,
          new TicketTypeRequest('ADULT', 1),
          new TicketTypeRequest('CHILD', 1),
        ),
      ).not.toThrow();
    });

    it('should accept Infant tickets with an Adult ticket', () => {
      expect(() =>
        ticketService.purchaseTickets(
          1,
          new TicketTypeRequest('ADULT', 1),
          new TicketTypeRequest('INFANT', 1),
        ),
      ).not.toThrow();
    });

    it('should reject more Infants than Adults', () => {
      expect(() =>
        ticketService.purchaseTickets(
          1,
          new TicketTypeRequest('ADULT', 1),
          new TicketTypeRequest('INFANT', 2),
        ),
      ).toThrow(InvalidPurchaseException);
    });

    it('should accept equal number of Infants and Adults', () => {
      expect(() =>
        ticketService.purchaseTickets(
          1,
          new TicketTypeRequest('ADULT', 2),
          new TicketTypeRequest('INFANT', 2),
        ),
      ).not.toThrow();
    });
  });
});
