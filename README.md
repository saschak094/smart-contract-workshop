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

# Starting With Wire-Transfer

We start by implementing funds transfers between users. In order to do that we'll need to model the problem and its domain first. Once we have a clear understanding of the problem we'll define the operation that will validate inputs and perform the transfer.

## Model File (slides)

Create your models required for WireTransfer
* User (name, email)
* Account (id, balance, User)
* WireTransfer (Sender, Receiver, amount)
* Event (amount, operation)


## Transaction Function 
Validate transaction:
* amount available and greather than 0 
* sufficient funds
* stop users from sending transactions to themselves)

 Fetch the Account Registry
 Process the transaction

## Access Control Rules
#### Implement the system access control rules: 
* Any participant can CREATE and READ all system resources

#### Restrict Access to User Account 
* Only the Owner has READ access to his Account

#### Wire Transfer Access Rules
* Every User can CREATE a Transaction. Transaction sender has to be the user itself (prevent to send money on behave of someone). Hint: Use condition
* Create two acl rules granting UPDATE and READ Permissions to both sender and receiver Accounts in the transaction context. Hint: Use transaction to bind variable for condition. Condition should check if the receiver/sender is the resource account. 


