# Openslava Smart Contract Workshop 

In this workshop you will be implementing a crowdfunding smart contract using the *Fabric Composer* framework.
The smart contract will be implemented in 2 phases.
- The goal of first phase will be to implement a simple mechanism for **transferring funds** between 2 users.
- Second phase will build on top of the wire-transfer capability to provide a simple **crowdfunding** use case.

# Introduction To Fabric Composer

Fabric Composer is a framework that simplifies the process of building a business network on top of Hyperledger Fabric blockchain. It provides abstractions over Fabric and introduces a simple but powerful DSL that allows us to capture common problems one may encounter while defining such network.

A business network in fabric-composer is defined as set of:
- **models** (assets, participants, transaction)
- **transaction functions**
- **access control rules**
- **query definitions**

# 1st Phase, Starting With Wire-Transfer

We start by implementing funds transfers between users. In order to do that we'll need to model the problem and its domain first. Once we have a clear understanding of the problem we'll define the operation that will validate inputs and perform the
transfer.

## Model File (slides)

TODO: add model description
- participants, assets, transactions, events
- syntax = types + references

## Model The Domain

We'll put all models into our model file `transaction.cto`. This file will contains several model definitions.

Before we start defining models we have to ensure they live in a unique namespace. This namespace will be later used to reference the models in our code. Let's name our namespace like this

```
namespace sk.openslava.transaction
```

and put it at the beginning of the file.

Firstly we'll need to define a model for our users. Every users will be identified by their email address. We would also like to store users real name. Let's make both email and name attributes of type `String`.

```
participant User identified by email {
  o String email
  o String name
}
```

Now that we recognize a user we want to assign an account for each users. `Account` will be identified by an string ID - let's name it *iban*. And it will hold users funds in a *balance* attribute. The balance can be a real number therefore we give it a `Double` type. We also need a *reference* to the user that will represent the account *owner*.

```
asset Account identified by iban {
  o String iban
  o Double balance
  --> User owner
}
```

Once we have an account we can model the transfer transaction. This transaction definition will be the type of the input parameter we will receive in our transaction function. Each transaction will hold 2 account references (one for sender and one for receiver). It will also bear the amount that is being transferred and an optional note for the receiver.

```
transaction WireTransfer {
  --> User sender
  --> User receiver
  o Double amount
  o String note optional
}
```

## Transactions File (slides)

The transaction file is a regular JavaScript file (in our case `logic.js`). It holds the logic that will be executed whenever we submit a wire-transfer request. The input of the function is our transaction model. The output is a `Promise` that resolves once our operation has completed. Our operation will leverage fabric-compose SDK to update the ledger's state. Transaction that are processed successfully (no error was triggered, inputs were correct, etc.) are persisted to a block.

- logic -> input transaction -> output update global state
- its basically javascript
    - es5
    - promises
    - error out with throw
- annotations - JSDoc
    - @transaction
    - @param
    - others?
- SDK most used functions

## Implementing Transaction Logic

The logical flow for wire transfer operation should be following:
- validate transaction inputs
- decrement sender's account balance by an amount
- increment receiver's account balance by an amount
- save the changes to the ledger

We'll split our programs logic into multiple functions. Let's start with the validation function.

```JavaScript
/*
 * @param {sk.openslava.transaction.WireTransfer} transaction - transfer to process
 */
function validateTransaction(transaction) {
    if (transaction.amount <= 0) {
        throw new Error('Amount must be a positive value');
    }

    if (transaction.sender.balance <= transaction.amount) {
        throw new Error('Insufficient funds to perform the wiretransfer');
    }
}
```

We know that the input is for our transaction is of type `transaction` defined in models file, so we use it.
We first check whether the transferred amount is a non-zero value. Otherwise we throw an error. Next we check the senders balance. If the amount is greater then sender's account balance we stop the transaction with an appropriate error.

Note: We could also check other fields of the transaction object (is the sender different from receiver etc.). This exercise is left to the reader.

Now let's implement the debit operation for sender. It will also take the `transaction` object as input.
It will decrement sender's account balance and return the update account.

```JavaScript
/*
 * @param {sk.openslava.transaction.WireTransfer} transaction - transfer to process
 */
function decrementSenderBalance(transaction) {
    var senderAccount = transaction.sender;
    var amount = transaction.amount;

    senderAccount.balance = senderAccount.balance - amount;
    return senderAccount;
}
```

Note: The credit operation is left as an exercise to the reader. We expect the function to be `incrementReceiverBalance(transaction) -> Account`.

Ok, let's put all of this together. We define a `processWireTransfer` function. It takes `transaction` as input parameter, calls all previously defined functions and uses the updated accounts to change the ledger's state.

This will require us to use an function defined in fabric-composer SDK - `getAssetRegistry`.
It takes *asset path* of type `String` and returns a `Promise` with requested `assetRegistry` as resolve parameter.

Asset Registry object contains several methods like `update` - for updating one value in the registry - or `updateAll` - for updating list of values.

```JavaScript
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
```

The code is pretty straight forward. We create an array of our updated accounts and pass it to `assetRegistry.updateAll` method.
Notice the `@transaction` annotation. This ensures our function will be called once the transaction is triggered.

## ACL File (slides)

We should have a functional network by this time. However there is one critical part missing. Every user can potentialy access any account on the network. 

## Restricting Account Access

The Access Control Rules live in a file with extension `.acl`. We want to achieve 2 things here.
- participants should be only able to access their own accounts
- wire-transfer function should be able to update both sender and receiver accounts (TODO: VALIDATE THIS!!!)

We'll name the first rule AccountAccess and it will grant users `read` access to their own accounts.
We don't want users to be able to create, update or delete any accounts.

```
rule AccountAccess {
    description: "AccountAccess - Owner of the account can read & update it."
    participant(user): "sk.openslava.transaction.User"
    operation: READ
    resource(account): "sk.openslava.transaction.Account"
    condition: (account.owner.getIdentifier() == user.getIdentifier())
    action: ALLOW
}
```

Notice the condition field and how it uses named participant and resource attributes. This ensures that only the owner of the account can operate on it.

# 2nd Phase, Adding Crowd Funding
TODO: everything