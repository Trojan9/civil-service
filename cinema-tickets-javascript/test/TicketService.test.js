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
      expect(() => ticketService.purchaseTickets(0)).toThrow(
        'Account ID must be a positive integer',
      );
    });

    it('should reject negative account ID', () => {
      expect(() => ticketService.purchaseTickets(-1)).toThrow(InvalidPurchaseException);
      expect(() => ticketService.purchaseTickets(-1)).toThrow(
        'Account ID must be a positive integer',
      );
    });

    it('should reject non-integer account ID', () => {
      expect(() => ticketService.purchaseTickets(1.5)).toThrow(InvalidPurchaseException);
      expect(() => ticketService.purchaseTickets(1.5)).toThrow(
        'Account ID must be a positive integer',
      );
    });

    it('should reject null account ID', () => {
      expect(() => ticketService.purchaseTickets(null)).toThrow(InvalidPurchaseException);
      expect(() => ticketService.purchaseTickets(null)).toThrow(
        'Account ID must be a positive integer',
      );
    });

    it('should reject undefined account ID', () => {
      expect(() => ticketService.purchaseTickets(undefined)).toThrow(InvalidPurchaseException);
      expect(() => ticketService.purchaseTickets(undefined)).toThrow(
        'Account ID must be a positive integer',
      );
    });

    it('should reject string account ID', () => {
      expect(() => ticketService.purchaseTickets('abc')).toThrow(InvalidPurchaseException);
      expect(() => ticketService.purchaseTickets('abc')).toThrow(
        'Account ID must be a positive integer',
      );
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
      expect(() => ticketService.purchaseTickets(1)).toThrow(
        'At least one ticket request is required',
      );
    });

    it('should reject when total tickets exceed 25', () => {
      expect(() => ticketService.purchaseTickets(1, new TicketTypeRequest('ADULT', 26))).toThrow(
        InvalidPurchaseException,
      );
      expect(() => ticketService.purchaseTickets(1, new TicketTypeRequest('ADULT', 26))).toThrow(
        'Cannot purchase more than 25 tickets at a time',
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
      expect(() =>
        ticketService.purchaseTickets(
          1,
          new TicketTypeRequest('ADULT', 20),
          new TicketTypeRequest('CHILD', 6),
        ),
      ).toThrow('Cannot purchase more than 25 tickets at a time');
    });

    it('should reject when zero tickets are requested', () => {
      expect(() => ticketService.purchaseTickets(1, new TicketTypeRequest('ADULT', 0))).toThrow(
        InvalidPurchaseException,
      );
      expect(() => ticketService.purchaseTickets(1, new TicketTypeRequest('ADULT', 0))).toThrow(
        'Total number of tickets must be greater than zero',
      );
    });

    it('should reject a plain object instead of TicketTypeRequest', () => {
      expect(() => ticketService.purchaseTickets(1, { type: 'ADULT', noOfTickets: 1 })).toThrow(
        InvalidPurchaseException,
      );
      expect(() => ticketService.purchaseTickets(1, { type: 'ADULT', noOfTickets: 1 })).toThrow(
        'All arguments must be instances of TicketTypeRequest',
      );
    });

    it('should reject a string instead of TicketTypeRequest', () => {
      expect(() => ticketService.purchaseTickets(1, 'ADULT')).toThrow(InvalidPurchaseException);
      expect(() => ticketService.purchaseTickets(1, 'ADULT')).toThrow(
        'All arguments must be instances of TicketTypeRequest',
      );
    });

    it('should reject null as a ticket request', () => {
      expect(() => ticketService.purchaseTickets(1, null)).toThrow(InvalidPurchaseException);
      expect(() => ticketService.purchaseTickets(1, null)).toThrow(
        'All arguments must be instances of TicketTypeRequest',
      );
    });

    it('should reject negative number of tickets', () => {
      expect(() => ticketService.purchaseTickets(1, new TicketTypeRequest('ADULT', -1))).toThrow(
        InvalidPurchaseException,
      );
      expect(() => ticketService.purchaseTickets(1, new TicketTypeRequest('ADULT', -1))).toThrow(
        'Number of tickets must not be negative',
      );
    });

    it('should reject negative tickets even when combined with valid tickets', () => {
      expect(() =>
        ticketService.purchaseTickets(
          1,
          new TicketTypeRequest('ADULT', 5),
          new TicketTypeRequest('CHILD', -2),
        ),
      ).toThrow(InvalidPurchaseException);
      expect(() =>
        ticketService.purchaseTickets(
          1,
          new TicketTypeRequest('ADULT', 5),
          new TicketTypeRequest('CHILD', -2),
        ),
      ).toThrow('Number of tickets must not be negative');
    });
  });

  describe('business rule validation', () => {
    it('should reject Child tickets without an Adult ticket', () => {
      expect(() => ticketService.purchaseTickets(1, new TicketTypeRequest('CHILD', 2))).toThrow(
        InvalidPurchaseException,
      );
      expect(() => ticketService.purchaseTickets(1, new TicketTypeRequest('CHILD', 2))).toThrow(
        'Child and Infant tickets cannot be purchased without an Adult ticket',
      );
    });

    it('should reject Infant tickets without an Adult ticket', () => {
      expect(() => ticketService.purchaseTickets(1, new TicketTypeRequest('INFANT', 1))).toThrow(
        InvalidPurchaseException,
      );
      expect(() => ticketService.purchaseTickets(1, new TicketTypeRequest('INFANT', 1))).toThrow(
        'Child and Infant tickets cannot be purchased without an Adult ticket',
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
      expect(() =>
        ticketService.purchaseTickets(
          1,
          new TicketTypeRequest('CHILD', 1),
          new TicketTypeRequest('INFANT', 1),
        ),
      ).toThrow('Child and Infant tickets cannot be purchased without an Adult ticket');
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
      expect(() =>
        ticketService.purchaseTickets(
          1,
          new TicketTypeRequest('ADULT', 1),
          new TicketTypeRequest('INFANT', 2),
        ),
      ).toThrow('Number of Infant tickets cannot exceed the number of Adult tickets');
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

  describe('payment calculation', () => {
    it('should charge £25 for a single Adult ticket', () => {
      ticketService.purchaseTickets(1, new TicketTypeRequest('ADULT', 1));
      expect(mockPaymentService.makePayment).toHaveBeenCalledWith(1, 25);
    });

    it('should charge £75 for 3 Adult tickets', () => {
      ticketService.purchaseTickets(1, new TicketTypeRequest('ADULT', 3));
      expect(mockPaymentService.makePayment).toHaveBeenCalledWith(1, 75);
    });

    it('should charge £40 for 1 Adult and 1 Child', () => {
      ticketService.purchaseTickets(
        1,
        new TicketTypeRequest('ADULT', 1),
        new TicketTypeRequest('CHILD', 1),
      );
      expect(mockPaymentService.makePayment).toHaveBeenCalledWith(1, 40);
    });

    it('should charge £25 for 1 Adult and 1 Infant (Infant is free)', () => {
      ticketService.purchaseTickets(
        1,
        new TicketTypeRequest('ADULT', 1),
        new TicketTypeRequest('INFANT', 1),
      );
      expect(mockPaymentService.makePayment).toHaveBeenCalledWith(1, 25);
    });

    it('should charge £95 for 2 Adults, 3 Children, and 1 Infant', () => {
      ticketService.purchaseTickets(
        1,
        new TicketTypeRequest('ADULT', 2),
        new TicketTypeRequest('CHILD', 3),
        new TicketTypeRequest('INFANT', 1),
      );
      expect(mockPaymentService.makePayment).toHaveBeenCalledWith(1, 95);
    });

    it('should correctly aggregate multiple requests for the same type', () => {
      ticketService.purchaseTickets(
        1,
        new TicketTypeRequest('ADULT', 2),
        new TicketTypeRequest('ADULT', 3),
      );
      expect(mockPaymentService.makePayment).toHaveBeenCalledWith(1, 125);
    });
  });

  describe('seat reservation', () => {
    it('should reserve 2 seats for 2 Adults', () => {
      ticketService.purchaseTickets(1, new TicketTypeRequest('ADULT', 2));
      expect(mockSeatReservationService.reserveSeat).toHaveBeenCalledWith(1, 2);
    });

    it('should reserve 3 seats for 1 Adult and 2 Children', () => {
      ticketService.purchaseTickets(
        1,
        new TicketTypeRequest('ADULT', 1),
        new TicketTypeRequest('CHILD', 2),
      );
      expect(mockSeatReservationService.reserveSeat).toHaveBeenCalledWith(1, 3);
    });

    it('should not reserve a seat for Infants', () => {
      ticketService.purchaseTickets(
        1,
        new TicketTypeRequest('ADULT', 2),
        new TicketTypeRequest('INFANT', 1),
      );
      expect(mockSeatReservationService.reserveSeat).toHaveBeenCalledWith(1, 2);
    });

    it('should reserve 5 seats for 2 Adults, 3 Children, and 1 Infant', () => {
      ticketService.purchaseTickets(
        1,
        new TicketTypeRequest('ADULT', 2),
        new TicketTypeRequest('CHILD', 3),
        new TicketTypeRequest('INFANT', 1),
      );
      expect(mockSeatReservationService.reserveSeat).toHaveBeenCalledWith(1, 5);
    });
  });

  describe('service integration', () => {
    it('should call payment service exactly once', () => {
      ticketService.purchaseTickets(1, new TicketTypeRequest('ADULT', 1));
      expect(mockPaymentService.makePayment).toHaveBeenCalledTimes(1);
    });

    it('should call seat reservation service exactly once', () => {
      ticketService.purchaseTickets(1, new TicketTypeRequest('ADULT', 1));
      expect(mockSeatReservationService.reserveSeat).toHaveBeenCalledTimes(1);
    });

    it('should not call services when validation fails', () => {
      expect(() => ticketService.purchaseTickets(0)).toThrow(InvalidPurchaseException);
      expect(() => ticketService.purchaseTickets(0)).toThrow(
        'Account ID must be a positive integer',
      );
      expect(mockPaymentService.makePayment).not.toHaveBeenCalled();
      expect(mockSeatReservationService.reserveSeat).not.toHaveBeenCalled();
    });

    it('should pass the correct account ID to both services', () => {
      ticketService.purchaseTickets(42, new TicketTypeRequest('ADULT', 1));
      expect(mockPaymentService.makePayment).toHaveBeenCalledWith(42, 25);
      expect(mockSeatReservationService.reserveSeat).toHaveBeenCalledWith(42, 1);
    });
  });

  describe('edge cases', () => {
    it('should handle max tickets (25) with mixed types', () => {
      ticketService.purchaseTickets(
        1,
        new TicketTypeRequest('ADULT', 10),
        new TicketTypeRequest('CHILD', 10),
        new TicketTypeRequest('INFANT', 5),
      );
      expect(mockPaymentService.makePayment).toHaveBeenCalledWith(1, 400);
      expect(mockSeatReservationService.reserveSeat).toHaveBeenCalledWith(1, 20);
    });

    it('should handle multiple separate TicketTypeRequest objects', () => {
      ticketService.purchaseTickets(
        1,
        new TicketTypeRequest('ADULT', 1),
        new TicketTypeRequest('CHILD', 1),
        new TicketTypeRequest('ADULT', 1),
        new TicketTypeRequest('CHILD', 1),
      );
      expect(mockPaymentService.makePayment).toHaveBeenCalledWith(1, 80);
      expect(mockSeatReservationService.reserveSeat).toHaveBeenCalledWith(1, 4);
    });
  });
});
