import logging

import azure.functions as func


def main(req: func.HttpRequest) -> func.HttpResponse:
    logging.info('Python HTTP trigger function processed a request.')

    loan_amount = req.params.get('loanAmount')
    account_amount = req.params.get('accountAmount')

    if not loan_amount or not account_amount:
        try:
            req_body = req.get_json()
        except ValueError:
            pass
        else:
            loan_amount = req_body.get('loanAmount')
            account_amount = req_body.get('accountAmount')

    if loan_amount and account_amount:
        loan_amount = float(loan_amount)
        account_amount = float(account_amount)
        if loan_amount > (account_amount * 0.75):
            return func.HttpResponse("Loan exceeds 75% of the account amount", status_code=403)
        else:
            return func.HttpResponse(status_code=200)
    else:
        return func.HttpResponse("Missing parameters", status_code=400)
