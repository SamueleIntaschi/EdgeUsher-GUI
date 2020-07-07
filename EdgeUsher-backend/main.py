from problog.engine import DefaultEngine
from problog.logic import Term
from flask import Flask, request
from flask_cors import CORS
from problog.program import PrologString
from problog.core import ProbLog
from problog import get_evaluatable
from problog.program import PrologString
from problog.formula import LogicFormula, LogicDAG
from problog.logic import Term
from problog.ddnnf_formula import DDNNF
from problog.cnf_formula import CNF
from problog.sdd_formula import SDD
from flask import jsonify
import os

#to install sdd package: python3 -m pip install -vvv --no-use-pep517  git+https://github.com/wannesm/PySDD.git#egg=PySDD

app = Flask(__name__)

CORS(app, resources={r"/*": {"origins": "*"}})

@app.route('/chain/', methods=['POST'])
def resultChain():
    print(request)
    if 'chain.pl' not in request.files:
        print('no file in request')
        return""
    chain = request.files['chain.pl']
    chain.save('chain.pl')
    return 'Chain received !'

@app.route('/infrastructure/', methods=['POST'])
def resultInfrastructure():
    if 'infra.pl' not in request.files:
        print('no file in request')
        return""
    infrastructure = request.files['infra.pl']
    infrastructure.save('infra.pl')
    return 'Infrastructure received'

@app.route('/query/', methods=['POST'])
def queryResult():
    data = request.json
    query = request.json.get('query')
    eu = request.json.get('eu')
    last = request.json.get('last')
    string0 = ":- consult('chain.pl').\n:- consult('infra.pl').\n:- consult('" + eu + ".pl').\n" + query
    print(string0)
    p = PrologString(string0)
    lf = LogicFormula.create_from(p)   # ground the program
    sdd = SDD.create_from(lf)
    string = ''
    result = sdd.evaluate()
    print(result)
    for it in result.items() :
        if string == '':
            string = ('%s : %s' % (it))
        else:
            string = string + '\n' + ('%s : %s' % (it))

if __name__ == '__main__':
    app.run(host='0.0.0.0', port= 5000, threaded=True)
