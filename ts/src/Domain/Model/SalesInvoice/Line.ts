export class Line
{
    private productId;
    private description;
    private quantity;
    private quantityPrecision;
    private tariff;
    private currency;
    private discount;
    private vatCode;
    private exchangeRate;

    constructor(productId, description, quantity, quantityPrecision, tariff, currency, discount, vatCode, exchangeRate)  {
        this.productId = productId;
        this.description = description;
        this.quantity = quantity;
        this.quantityPrecision = quantityPrecision;
        this.tariff = tariff;
        this.currency = currency;
        this.discount = discount;
        this.vatCode = vatCode;
        this.exchangeRate = exchangeRate;
    }

    public amount(): number
    {
        return Number(Number((this.quantity.toFixed(this.quantityPrecision))) * this.tariff).toFixed(2);
    }

    public discountAmount(): number
    {
        if (this.discount === null) {
            return 0.0;
        }

        return Number((this.amount() * this.discount / 100).toFixed(2));
    }

    public netAmount(): number
    {
        return Number((this.amount() - this.discountAmount()).toFixed(2));
    }

    public vatAmount(): number
    {
        let vatRate = 0;
        if (this.vatCode === 'S') {
            vatRate = 21.0;
        } else if (this.vatCode === 'L') {
            if (new Date() < Date.parse('2019-01-01')) {
                vatRate = 6.0;
            } else {
                vatRate = 9.0;
            }
        } else {
            throw new Error('Should not happen');
        }

        return Number((this.netAmount() * vatRate / 100).toFixed(2));
    }
}
