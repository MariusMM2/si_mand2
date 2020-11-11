import json
import logging

import azure.functions as func


def main(req: func.HttpRequest) -> func.HttpResponse:
    logging.info('Python HTTP trigger function processed a request.')

    amount = req.params.get('amount')
    if not amount:
        try:
            req_body = req.get_json()
        except ValueError:
            pass
        else:
            amount = req_body.get('amount')

    if amount:
        return func.HttpResponse(json.dumps({'amount': float(amount) * 1.02}))
    else:
        return func.HttpResponse("Missing 'amount' parameter", status_code=400)
