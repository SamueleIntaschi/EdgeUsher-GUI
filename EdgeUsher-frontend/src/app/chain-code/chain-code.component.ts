import { Component, OnInit, Output, EventEmitter, ViewChild } from '@angular/core';
import 'node_modules/codemirror/mode/python/python';
import {CodeMirror} from 'codemirror';
import { CodemirrorComponent } from 'ng2-codemirror';


@Component({
  selector: 'app-chain-code',
  templateUrl: './chain-code.component.html',
  styleUrls: ['./chain-code.component.css']
})

export class ChainCodeComponent implements OnInit{

  @ViewChild('codepage') codepage: any;
  code = '';
  constructor() {
    //var d = document.getElementsByClassName(".CodeMirror") as HTMLCollectionOf<HTMLElement>;
    //d[0].style.backgroundColor = 'lightblue';
  }

  ngOnInit() {
  }

  config = {
    lineNumbers: true,
    lineWrapping: true,
    autoRefresh: true,
    theme: "material-ocean",
    extraKeys: {"Ctrl-Space": "autocomplete"},
    mime: "text/x-squirrel",  
    mode: "python",
    readOnly: true,
    viewportMargin: Infinity,
    //Theme
    styleActiveLine: true,
    matchBrackets: true,
    gutter: true
  };

  /*
  themes = ["3024-day", "3024-night", "abcdef", "ambiance-mobile", "ambiance", "base16-dark", "base16-light", "bespin", "blackboard", "cobalt", "colorforth", "darcula", "dracula", "duotone-dark", "duotone-light", "eclipse", "elegant", "erlang-dark", "gruvbox-dark", "hopscotch", "icecoder", "idea", "isotope", "lesser-dark", "liquibyte", "lucario", "material", "mbo", "mdn-like", "midnight", "monokai", "neat", "neo", "night", "oceanic-next", "panda-syntax", "paraiso-dark", "paraiso-light", "pastel-on-dark", "railscasts", "rubyblue", "seti", "shadowfox", "solarized", "ssms", "the-matrix", "tomorrow-night-bright", "tomorrow-night-eighties", "ttcn", "twilight", "vibrant-ink", "xq-dark", "xq-light", "yeti", "zenburn"];

  onThemeSelect( theme_name )
  {
    this.config.theme = theme_name;
  }
  */
  onFocus(){

  }
  onBlur(){

  }

  setCode(s: Array<string>) {
    //(document.getElementsByClassName('CodeMirror') as HTMLCollectionOf<HTMLElement>)[0].style.height = '100%';
    //(document.getElementsByClassName('CodeMirror') as HTMLCollectionOf<HTMLElement>)[0].style.border = '1px solid #eee';
    var cm = this.codepage.instance;
    for (var i in s) {
      if (Number(i) == 0) this.code = s[i];
      else this.code = this.code + '\n\n' + s[i];
    }
    cm.setSize('100%', '100%');
    cm.refresh();
  }

  refresh() {
    this.codepage.instance.refresh();
  }
}
