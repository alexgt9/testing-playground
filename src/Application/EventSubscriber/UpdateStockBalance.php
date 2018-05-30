<?php
declare(strict_types=1);

namespace Application\EventSubscriber;

use Application\ReadModel\BalanceRepository;
use Domain\Model\ReceiptNote\GoodsReceived;
use Domain\Model\ReceiptNote\ReceiptUndone;

final class UpdateStockBalance
{
    /**
     * @var BalanceRepository
     */
    private $balanceRepository;

    public function __construct(BalanceRepository $balanceRepository)
    {
        $this->balanceRepository = $balanceRepository;
    }

    public function whenGoodsReceived(GoodsReceived $goodsReceived): void
    {
        $currentBalance = $this->balanceRepository->getBalanceFor($goodsReceived->productId());

        $updatedBalance = $currentBalance->processReceipt($goodsReceived->quantity());

        $this->balanceRepository->save($updatedBalance);
    }

    public function whenReceiptUndone(ReceiptUndone $receiptUndone): void
    {
        $currentBalance = $this->balanceRepository->getBalanceFor($receiptUndone->productId());

        $updatedBalance = $currentBalance->undoReceipt($receiptUndone->quantity());

        $this->balanceRepository->save($updatedBalance);
    }
}
