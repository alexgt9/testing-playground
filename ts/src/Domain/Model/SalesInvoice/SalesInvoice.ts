import { Line } from './Line'

export class SalesInvoice
{
    private customerId;
    private currency;
    private exchangeRate;
    private quantityPrecision;
    private lines = [];
    private _isFinalized = false;
    private _isCancelled = false;
    private invoiceDate;

    public constructor()
    {
    }

    public setCustomerId(customerId: number): void
    {
        this.customerId = customerId;
    }

    public setInvoiceDate(invoiceDate: Date): void
    {
        this.invoiceDate = invoiceDate;
    }

    public setCurrency(currency: string): void
    {
        this.currency = currency;
    }

    public setExchangeRate(exchangeRate: number | null): void
    {
        this.exchangeRate = exchangeRate;
    }

    public setQuantityPrecision(quantityPrecision: number): void
    {
        this.quantityPrecision = quantityPrecision;
    }

    public addLine(
        productId: number,
        description: string,
        quantity: number,
        tariff: number,
        discount: number | null,
        vatCode: string
    ): void {
        if (!['S', 'L'].includes(vatCode)) {
            throw new Error('Invalid vat code');
        }
        this.lines.push(new Line(
            productId,
            description,
            quantity,
            this.quantityPrecision,
            tariff,
            this.currency,
            discount,
            vatCode,
            this.exchangeRate
        ));
    }

    public totalNetAmount(): number
    {
        let sum = this.lines.reduce((total, line) => {
            return total += line.netAmount();
        }, 0);

        return Number(sum.toFixed(2));
    }

    public totalNetAmountInLedgerCurrency(): number
    {
        if (this.currency === 'EUR' || this.exchangeRate == null) {
            return this.totalNetAmount();
        }

        return Number((this.totalNetAmount() / this.exchangeRate).toFixed(2));
    }

    public totalVatAmount(): number
    {
        let sum = this.lines.reduce((total, line) => {
            return total += line.vatAmount();
        }, 0);

        return Number(sum.toFixed(2));
    }

    public totalVatAmountInLedgerCurrency(): number
    {
        if (this.currency === 'EUR' || this.exchangeRate == null) {
            return this.totalVatAmount();
        }

        return Number((this.totalVatAmount() / this.exchangeRate).toFixed(2));
    }

    public setFinalized(finalized: bool): void
    {
        this._isFinalized = finalized;
    }

    public isFinalized(): bool
    {
        return this._isFinalized;
    }

    public setCancelled(cancelled: bool): void
    {
        this._isCancelled = cancelled;
    }

    public isCancelled(): bool
    {
        return this._isCancelled;
    }
}
