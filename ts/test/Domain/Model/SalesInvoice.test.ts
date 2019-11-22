import { Line }         from '../../../src/Domain/Model/SalesInvoice/Line'
import { SalesInvoice } from '../../../src/Domain/Model/SalesInvoice/SalesInvoice'

test('adds 1 + 2 to equal 3', () => {
    let line = new Line(
        123,
        'description',
        2.3,
        5,
        2.3,
        'currency',
        2.3,
        'vatCode',
        2.3
    );

  expect(true).toBeTrue;
});



test('it_calculates_the_correct_totals_for_an_invoice_in_foreign_currency', () => {
    let salesInvoice = new SalesInvoice();
    salesInvoice.setCustomerId(1001);
    salesInvoice.setInvoiceDate(new Date());
    salesInvoice.setCurrency('USD');
    salesInvoice.setExchangeRate(1.3);
    salesInvoice.setQuantityPrecision(3);

    salesInvoice.addLine(
        1,
        'Product with a 10% discount and standard VAT applied',
        2.0,
        15.0,
        10.0,
        'S'
    );
    salesInvoice.addLine(
        2,
        'Product with no discount and low VAT applied',
        3.123456,
        12.50,
        null,
        'L'
    );

    /*
     * 2 * 15.00 - 10% = 27.00
     * +
     * 3.123 * 12.50 - 0% = 39.04
     * =
     * 66.04
     */
    expect(salesInvoice.totalNetAmount()).toBe(66.04);

    /*
     * 66.04 / 1.3 = 50.80
     */
    expect(salesInvoice.totalNetAmountInLedgerCurrency()).toBe(50.80);

    /*
     * 27.00 * 21% = 5.67
     * +
     * 39.04 * 9% = 3.51
     * =
     * 9.18
     */
    expect(salesInvoice.totalVatAmount()).toBe(9.18);

    /*
     * 9.18 / 1.3 = 7.06
     */
    expect(salesInvoice.totalVatAmountInLedgerCurrency()).toBe(7.06);
});

test('it_calculates_the_correct_totals_for_an_invoice_in_ledger_currency', () => {
    let salesInvoice = createSalesInvoice();
    salesInvoice.addLine(
        aProductId(),
        'Product with a 10% discount and standard VAT applied',
        2.0,
        15.0,
        10.0,
        'S'
    );
    salesInvoice.addLine(
        anotherProductId(),
        'Product with no discount and low VAT applied',
        3.123456,
        12.50,
        null,
        'L'
    );

    expect(salesInvoice.totalNetAmountInLedgerCurrency()).toBe(salesInvoice.totalNetAmount());
    expect(salesInvoice.totalVatAmountInLedgerCurrency()).toBe(salesInvoice.totalVatAmount());
});

test('it_fails_when_you_provide_an_unknown_vat_code', () => {
    let salesInvoice = createSalesInvoice();

    expect(() => {
        salesInvoice.addLine(
            aProductId(),
            aDescription(),
            aQuantity(),
            aTariff(),
            null,
            'Invalid VAT code'
        )
    }).toThrow(Error);
});

test('you_can_finalize_an_invoice', () => {
    let salesInvoice = createSalesInvoice();
    expect(salesInvoice.isFinalized()).toBeFalsy();

    salesInvoice.setFinalized(true);

    expect(salesInvoice.isFinalized()).toBeTruthy();
});

test('you_can_cancel_an_invoice', () => {
    let salesInvoice = createSalesInvoice();
    expect(salesInvoice.isCancelled()).toBeFalsy();

    salesInvoice.setCancelled(true);

    expect(salesInvoice.isCancelled()).toBeTruthy();
});

let createSalesInvoice = () =>
{
    let salesInvoice = new SalesInvoice();
    salesInvoice.setCustomerId(1001);
    salesInvoice.setInvoiceDate(new Date());
    salesInvoice.setCurrency('EUR');
    salesInvoice.setQuantityPrecision(3);

    return salesInvoice;
}

let aDescription = () =>
{
    return 'Description';
}

let aQuantity = () =>
{
    return 2.0;
}

let aTariff = () =>
{
    return 15.0;
}

let aProductId = () =>
{
    return 1;
}

let anotherProductId = () =>
{
    return 2;
}
