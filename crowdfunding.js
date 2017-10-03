/*
 * @param {sk.openslava.crowdfunding.FundCampaign} funding - funding to process
 * @transaction
 */
function processFunding(funding) {
    validateFunding(funding);
    return getAssetRegistry('sk.openslava.crowdfunding.Project')
        .then(function (accountRegistry) {
            return accountRegistry.update(
                incrementPledgeAmount(funding)
            );
        });
}

/*
 * @param {sk.openslava.crowdfunding.FundProject} funding - funding to process
 */
function validateFunding(funding) {
    if (funding.amount <= 0) {
        throw new Error('Amount must be a positive value');
    }
    if (funding.funder.balance < funding.amount ) {
        throw new Error('Insufficient funds to perform the funding');
    } 
    if (funding.project.status === "CLOSED"){
        throw new Error('Funding period is already over');
    }
}


/*
 * @param {sk.openslava.crowdfunding.FundProject} funding - funding to process
 */
function incrementPledgeAmount(funding) {
    var amount = funding.amount;
    var project = funding.project;
    project.pledgeAmount = project.pledgeAmount + amount;
    return project;
}

