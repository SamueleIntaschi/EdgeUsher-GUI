import {Component, Inject, Input, Output, EventEmitter, OnInit} from '@angular/core';

//TODO: nella parte dove si vede il risultato scrivere gli and/or di giallo arancione o rosso

//TODO: lasciare la parte mostrante il risultato sempre presente in alto, magari settando un'altezza fissata e permettendo lo scrolling

export class Rule {
  cond: string;
  singleReq: string;
  nestedRules: Array<Rule>;
}

export class SecRequirement {
  name: string;
  id: string;
}

@Component({
  selector: 'app-query-builder',
  templateUrl: './query-builder.component.html',
  styleUrls: ['./query-builder.component.css']
})
export class QueryBuilderComponent implements OnInit {

  @Input('initCond') cond0: string;
  @Input('initRules') rules0: Array<Rule>;
  @Output() rulesChange = new EventEmitter<Array<Rule>>();
  @Output() condChange = new EventEmitter<string>();
  constructor() { }
  cond = 'list';
  rules: Array<Rule> = [];
  secRequisites = [
    {name: 'Access logs', id: 'access_logs'},
    {name: 'Authentication', id: 'authentication'},
    {name: 'Host IDS', id: 'host_IDS'},
    {name: 'Process isolation', id: 'process_isolation'},
    {name: 'Permission model', id: 'permission_model'},
    {name: 'Resource usage monitoring', id: 'resource_monitoring'},
    {name: 'Restore points', id: 'restore_points'},
    {name: 'User data isolation', id: 'user_data_isolation'},
    {name: 'Certificates', id: 'certificates'},
    {name: 'Firewall', id: 'firewall'},
    {name: 'IoT data encryption', id: 'iot_data_encryption'},
    {name: 'Node isolation mechanisms', id: 'node_isolation_mechanisms'},
    {name: 'Network IDS', id: 'network_IDS'},
    {name: 'Public key cryptography', id: 'pki'},
    {name: 'Wireless security', id: 'wireless_security'},
    {name: 'Backup', id: 'backup'},
    {name: 'Encrypted storage', id: 'encrypted_storage'},
    {name: 'Obfuscated storage', id: 'obfuscated_storage'},
    {name: 'Access control', id: 'access_control'},
    {name: 'Anti-tampering capabilities', id: 'anti_tampering'},
    {name: 'Audit', id: 'audit'}
  ];

  ngOnInit(): void {
    if (this.rules0 != undefined) {
      this.rules = this.rules0;
    }
    if (this.cond0 != undefined) {
      this.cond = this.cond0;
    }
  }

  onChange() {
    this.rulesChange.emit(this.rules);
  }

  addRuleset(rule) {
    var r = {
      cond: 'and',
      singleReq: '',
      nestedRules: [],
    };
    rule.nestedRules.push(r);
    //console.log(document.getElementById('li:last-child')[0]);
    this.rulesChange.emit(this.rules);
  }

  addRuleset0() {
    this.rules.push({
      cond: 'and',
      singleReq: '',
      nestedRules: []
    });
    this.rulesChange.emit(this.rules);
  }

  addRule0() {
    this.rules.push({
      cond: 'single',
      singleReq: '',
      nestedRules: [],
    });
    this.rulesChange.emit(this.rules);
  }

  addRule(rule) {
    var r = {
      cond: 'single',
      singleReq: '',
      nestedRules: [],
    };
    rule.nestedRules.push(r);
    this.rulesChange.emit(this.rules);
  }


  deleteRule(rule, rules) {
    rules.splice(rule, 1);
    this.rulesChange.emit(this.rules);
  }

  ruleReq() {
    this.cond = 'and';
    this.condChange.emit(this.cond);
  }

  listReq() {
    this.cond = 'list';
    for (var i in this.rules) {
      this.rules[i].cond = 'single';
      this.rules[i].nestedRules = [];
    }
    this.condChange.emit(this.cond);
  }

  andReq(rule) {
    rule.cond = 'and';
    this.rulesChange.emit(this.rules);
  }

  andReq0() {
    this.cond = 'and';
    this.condChange.emit(this.cond);
  }

  orReq0() {
    this.cond = 'or';
    this.condChange.emit(this.cond);
  }

  orReq(rule) {
    rule.cond = 'or';
    this.rulesChange.emit(this.rules);
  }

  saveReqCond(rule): string {
    var tmp = '';
    if (rule.cond == 'single') {
      return rule.singleReq;
    }
    else {
      for (var i in rule.nestedRules) {
        var rule1 = rule.nestedRules[i];
        if (tmp == '') tmp = this.saveReqCond(rule1);
        else tmp = tmp + ', ' + this.saveReqCond(rule1);
      }
      tmp = rule.cond + '(' + tmp +')';
    }
    return tmp
  }

  saveReq() {
    var secRule = '';
    if (this.cond == 'list') {
      for (var i in this.rules) {
        if (secRule == '') secRule = this.rules[i].singleReq;
        else secRule = secRule + ', ' + this.rules[i].singleReq;
      }
      secRule = '[' + secRule + ']';
    }
    else {
      var tmp = '';
      for (var i in this.rules) {
        if (tmp == '') tmp = this.saveReqCond(this.rules[i]);
        else tmp = tmp + ', ' + this.saveReqCond(this.rules[i]);
      }
      secRule = this.cond + '(' + tmp + ')';
    }
    return secRule;
  }

}
