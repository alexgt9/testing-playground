<?php
declare(strict_types=1);

namespace Test\Acceptance;

use Application\Service\CreateReceiptNote\CreateReceiptNote;
use Application\Service\PlacePurchaseOrder\Line as PurchaseOrderLine;
use Application\Service\PlacePurchaseOrder\PlacePurchaseOrder;
use Behat\Behat\Context\Context;
use Behat\Behat\Tester\Exception\PendingException;
use Domain\Model\Product\ProductId;
use Domain\Model\PurchaseOrder\PurchaseOrder;
use Domain\Model\ReceiptNote\ReceiptNote;
use Infrastructure\ServiceContainer;
use Ramsey\Uuid\Uuid;
use Application\Service\CreateReceiptNote\Line as ReceiptNoteLine;

final class FeatureContext implements Context
{
    /**
     * @var string[]|array
     */
    private $productIds = [];

    /**
     * @var string
     */
    private $supplierId;

    /**
     * @var PurchaseOrder
     */
    private $purchaseOrder;

    /**
     * @var ReceiptNote
     */
    private $receiptNote;

    /**
     * @var ServiceContainer
     */
    private $container;

    /**
     * @BeforeScenario
     */
    public function setUp(): void
    {
        $this->supplierId = Uuid::uuid4()->toString();
        $this->container = new ServiceContainer();
    }

    /**
     * @Given /^the catalog contains product "([^"]*)"$/
     * @param string $name
     */
    public function theCatalogContainsProduct(string $name): void
    {
        $this->productIds[$name] = Uuid::uuid4()->toString();
    }

    /**
     * @Given /^I placed a purchase order with product "([^"]*)", quantity ([\d\.]+)$/
     * @param string $productName
     * @param string $orderedQuantity
     */
    public function iPlacedAPurchaseOrderForProductQuantity(string $productName, string $orderedQuantity): void
    {
        $dto = new PlacePurchaseOrder;
        $dto->supplierId = $this->supplierId;
        $lineDto = new PurchaseOrderLine();
        $lineDto->quantity = (float)$orderedQuantity;
        $lineDto->productId = $this->productIds[$productName];
        $dto->lines[] = $lineDto;

        $this->purchaseOrder = $this->container->placePurchaseOrderService()->place($dto);
    }

    /**
     * @When /^I create[d]? a receipt note for this purchase order, receiving ([\d\.]+) items of product "([^"]*)"$/
     * @param string $receiptQuantity
     * @param string $productName
     */
    public function iCreateAReceiptNoteForThisPurchaseOrderReceivingItemsOfProduct(string $receiptQuantity, string $productName): void
    {
        $dto = new CreateReceiptNote();
        $dto->purchaseOrderId = $this->purchaseOrder->purchaseOrderId()->asString();
        $lineDto = new ReceiptNoteLine();
        $lineDto->productId = $this->productIds[$productName];
        $lineDto->quantity = (float)$receiptQuantity;
        $dto->lines[] = $lineDto;

        $this->receiptNote = $this->container->createReceiptNoteService()->create($dto);
    }

    /**
     * @Then /^I expect the purchase order not to be fully delivered yet$/
     */
    public function iExpectThePurchaseOrderNotToBeFullyDeliveredYet(): void
    {
        assertFalse($this->purchaseOrder->isFullyDelivered());
    }

    /**
     * @Then /^I expect the purchase order to be fully delivered/
     */
    public function iExpectThePurchaseOrderToBeFullyDelivered(): void
    {
        assertTrue($this->purchaseOrder->isFullyDelivered());
    }

    /**
     * @Then the stock level for product :productName will be :stockLevel
     */
    public function theStockLevelForProductWillBe(string $productName, string $stockLevel)
    {
        $balance = $this->container->balanceRepository()->getBalanceFor(
            ProductId::fromString($this->productIds[$productName])
        );

        assertEquals((float)$stockLevel, $balance->stockLevel()->asFloat());
    }
}
