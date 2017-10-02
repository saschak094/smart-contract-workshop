/*
 * @param {sk.openslava.transaction.WireTransfer} transaction - transfer to process
 * @transaction
 */
function processWireTransfer(transaction) {
    validateTransaction(transaction);

    return getAssetRegistry('sk.openslava.transaction.Account')
        .then(function (accountRegistry) {
            return accountRegistry.updateAll([
                decrementSenderBalance(transaction), 
                incrementReceiverBalance(transaction)
            ]);
        });
}

/*
 * @param {sk.openslava.transaction.WireTransfer} transaction - transfer to process
 */
function validateTransaction(transaction) {
    if (transaction.amount <= 0) {
        throw new Error('Amount must be a positive value');
    }

    if (transaction.sender.balance < transaction.amount) {
        throw new Error('Insufficient funds to perform the wiretransfer');
    }
}

/*
 * @param {sk.openslava.transaction.WireTransfer} transaction - transfer to process
 */
function decrementSenderBalance(transaction) {
    var senderAccount = transaction.sender;
    var amount = transaction.amount;

    senderAccount.balance = senderAccount.balance - amount;
    return senderAccount;
}

/*
 * @param {sk.openslava.transaction.WireTransfer} transaction - transfer to process
 */
function incrementReceiverBalance(transaction) {
    var receiverAccount = transaction.receiver;
    var amount = transaction.amount;

    receiverAccount.balance = receiverAccount.balance + amount;
    return receiverAccount;
}
