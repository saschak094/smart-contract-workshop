/*
 * @param {mountain.camp.crowdfunding.FundCampaign} funding - funding to process
 * @transaction
 */
function processFunding(funding) {
    validateFunding(funding);
    return getAssetRegistry('mountain.camp.crowdfunding.Campaign')
        .then(function (accountRegistry) {
            return accountRegistry.update(
                incrementPledgeAmount(funding)
            );
        });
}

/*
 * @param {mountain.camp.crowdfunding.FundCampaign} funding - funding to process
 */
function validateFunding(funding) {
    if (funding.amount <= 0) {
        throw new Error('Amount must be a positive value');
    }
    if (funding.funder.balance < funding.amount) {
        throw new Error('Insufficient funds to perform the funding');
    }
    if (funding.campaign.status === "CLOSED") {
        throw new Error('Funding period is already over');
    }
}

/*
 * @param {mountain.camp.crowdfunding.FundCampaign} funding - funding to process
 */
function incrementPledgeAmount(funding) {
    var amount = funding.amount;
    var campaign = funding.campaign;
    campaign.pledgeAmount = campaign.pledgeAmount + amount;
    return campaign;
}

