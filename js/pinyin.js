var pinyinUtil = {
    dict: {},
    parseDict: function () {
        if (window.pinyin_dict_notone) {
            this.dict.notone = {};
            this.dict.py2hz = pinyin_dict_notone;
            for (var i in pinyin_dict_notone) {
                var temp = pinyin_dict_notone[i];
                for (var j = 0, len = temp.length; j < len; j++) {
                    if (!this.dict.notone[temp[j]]) this.dict.notone[temp[j]] = i;
                }
            }
        }
    },
    getPinyin: function (chinese, splitter, withtone, polyphone) {
        if (!chinese || /^ +$/g.test(chinese)) return '';
        splitter = splitter == undefined ? ' ' : splitter;
        withtone = withtone == undefined ? true : withtone;
        polyphone = polyphone == undefined ? false : polyphone;
        var result = [];
        if (this.dict.notone) {
            if (withtone) console.warn('pinyin_dict_notone 字典文件不支持声调！');
            if (polyphone) console.warn('pinyin_dict_notone 字典文件不支持多音字！');
            var noChinese = '';
            for (var i = 0, len = chinese.length; i < len; i++) {
                var temp = chinese.charAt(i),
                    pinyin = this.dict.notone[temp];
                if (pinyin) {
                    noChinese && (result.push(noChinese), noChinese = '');
                    result.push(pinyin);
                } else if (!temp || /^ +$/g.test(temp)) {
                    noChinese && (result.push(noChinese), noChinese = '');
                } else {
                    noChinese += temp;
                }
            }
            if (noChinese) {
                result.push(noChinese);
                noChinese = '';
            }
        } else {
            throw '抱歉，未找到合适的拼音字典文件！';
        }
        return result.join(splitter);
    },
    getHanzi: function (pinyin) {
        if (!this.dict.py2hz) {
            throw '抱歉，未找到合适的拼音字典文件！';
        }
        return this.dict.py2hz[pinyin] || '';
    }
};

var SimpleInputMethod = {
    pageSize: 9, // 修改为每页显示 9 个候选词
    pageCurrent: 1,
    pageCount: 0,
    hanzi: '',
    pinyin: '',
    result: [],
    _input: null,
    _target: null,
    _pinyinTarget: null,
    _resultTarget: null,
    initDict: function () {
        var dict = pinyinUtil.dict;
        if (!dict.py2hz) throw '未找到合适的字典文件！';
        dict.py2hz2 = {};
        dict.py2hz2['i'] = 'i';
        for (var i = 97; i <= 123; i++) {
            var ch = String.fromCharCode(i);
            if (!dict.py2hz[ch]) {
                for (var j in dict.py2hz) {
                    if (j.indexOf(ch) == 0) {
                        dict.py2hz2[ch] = dict.py2hz[j];
                        break;
                    }
                }
            }
        }
    },
    initDom: function () {
        var temp = '<div class="pinyin"></div><div class="result"><ol></ol><div class="page-up-down"><span class="page-up">▲</span><span class="page-down">▼</span></div></div>';
        var dom = document.createElement('div');
        dom.id = 'simle_input_method';
        dom.className = 'simple-input-method';
        dom.innerHTML = temp;
        var that = this;
        dom.addEventListener('click', function (e) {
            var target = e.target;
            if (target.nodeName == 'LI') {
                that.selectHanzi(parseInt(target.dataset.idx));
            } else if (target.nodeName == 'SPAN') {
                if (target.className == 'page-up' && that.pageCurrent > 1) {
                    that.pageCurrent--;
                    that.refreshPage();
                    that._input.focus(); // 确保焦点回到输入框
                } else if (target.className == 'page-down' && that.pageCurrent < that.pageCount) {
                    that.pageCurrent++;
                    that.refreshPage();
                    that._input.focus(); // 确保焦点回到输入框
                }
            }
        });
        document.body.appendChild(dom);
    },
    init: function (selector) {
        this.initDict();
        this.initDom();
        var obj = document.querySelectorAll(selector);
        this._target = document.querySelector('#simle_input_method');
        this._pinyinTarget = document.querySelector('#simle_input_method .pinyin');
        this._resultTarget = document.querySelector('#simle_input_method .result ol');
        var that = this;
        for (var i = 0; i < obj.length; i++) {
            obj[i].addEventListener('keydown', function (e) {
                // 新增对 Ctrl/Cmd 组合键的检查
                if (e.ctrlKey || e.metaKey) {
                    return; // 允许 Ctrl/Cmd 组合键操作
                }

                var keyCode = e.keyCode;
                var preventDefault = false;
                if (keyCode >= 65 && keyCode <= 90) {
                    that.addChar(String.fromCharCode(keyCode + 32), this);
                    preventDefault = true;
                } else if (keyCode == 8 && that.pinyin) {
                    that.delChar();
                    preventDefault = true;
                } else if (keyCode >= 48 && keyCode <= 57 && !e.shiftKey && that.pinyin) {
                    var idx = keyCode - 48;
                    if (idx >= 1) {
                        var realIdx = (that.pageCurrent - 1) * that.pageSize + idx - 1;
                        if (realIdx < that.result.length) {
                            that.selectHanzi(idx);
                            preventDefault = true;
                        }
                    }
                } else if (keyCode == 32 && that.pinyin) {
                    that.selectHanzi(1);
                    preventDefault = true;
                } else if (keyCode == 33 && that.pageCount > 0 && that.pageCurrent > 1) {
                    that.pageCurrent--;
                    that.refreshPage();
                    that._input.focus(); // 确保焦点回到输入框
                    preventDefault = true;
                } else if (keyCode == 34 && that.pageCount > 0 && that.pageCurrent < that.pageCount) {
                    that.pageCurrent++;
                    that.refreshPage();
                    that._input.focus(); // 确保焦点回到输入框
                    preventDefault = true;
                }
                // 新增翻页功能，并增加边界检查
                else if ((keyCode == 189 || keyCode == 188) && that.pageCount > 0 && that.pageCurrent > 1) {
                    that.pageCurrent--;
                    that.refreshPage();
                    that._input.focus(); // 确保焦点回到输入框
                    preventDefault = true;
                } else if ((keyCode == 187 || keyCode == 190) && that.pageCount > 0 && that.pageCurrent < that.pageCount) {
                    that.pageCurrent++;
                    that.refreshPage();
                    that._input.focus(); // 确保焦点回到输入框
                    preventDefault = true;
                }
                // 新增对第一页时的特殊处理
                else if ((keyCode == 189 || keyCode == 188) && that.pageCount > 0 && that.pageCurrent == 1) {
                    preventDefault = true; // 阻止默认行为，但不翻页
                } else if ((keyCode == 187 || keyCode == 190) && that.pageCount > 0 && that.pageCurrent == that.pageCount) {
                    preventDefault = true; // 阻止默认行为，但不翻页
                }
                if (preventDefault) e.preventDefault();
            });
            obj[i].addEventListener('focus', function () {
                if (that._input !== this) that.hide();
            });
        }
    },
    getSingleHanzi: function (pinyin) {
        return pinyinUtil.dict.py2hz2[pinyin] || pinyinUtil.dict.py2hz[pinyin] || '';
    },
    getHanzi: function (pinyin) {
        var result = this.getSingleHanzi(pinyin);
        if (result) return [result.split(''), pinyin];
        var temp = '';
        for (var i = 0, len = pinyin.length; i < len; i++) {
            temp += pinyin[i];
            result = this.getSingleHanzi(temp);
            if (!result) continue;
            var flag = false;
            if ((i + 1) < pinyin.length) {
                for (var j = 1, len = pinyin.length; j <= 5 && (i + j) < len; j++) {
                    if (this.getSingleHanzi(pinyin.substr(0, i + j + 1))) {
                        flag = true;
                        break;
                    }
                }
            }
            if (!flag) return [result.split(''), pinyin.substr(0, i + 1) + "'" + pinyin.substr(i + 1)];
        }
        return [[], ''];
    },
    selectHanzi: function (i) {
        var hz = this.result[(this.pageCurrent - 1) * this.pageSize + i - 1];
        if (!hz) return;
        this.hanzi += hz;
        var idx = this.pinyin.indexOf("'");
        if (idx > 0) {
            this.pinyin = this.pinyin.substr(idx + 1);
            this.refresh();
        } else {
            this._input.value += this.hanzi;
            this.hide();
        }
    },
    refresh: function () {
        var temp = this.getHanzi(this.pinyin.replace(/'/g, ''));
        this.result = temp[0];
        this.pinyin = temp[1];
        var count = this.result.length;
        this.pageCurrent = 1;
        this.pageCount = Math.ceil(count / this.pageSize);
        this._pinyinTarget.innerHTML = this.hanzi + this.pinyin;

        // 如果没有候选词，直接将拼音输入到文本框
        if (count === 0) {
            this._input.value += this.pinyin;
            this.hide();
        } else {
            this.refreshPage();
        }
    },
    refreshPage: function () {
        var temp = this.result.slice((this.pageCurrent - 1) * this.pageSize, this.pageCurrent * this.pageSize);
        var html = '';
        var i = 0;
        temp.forEach(function (val) {
            html += '<li data-idx="' + (++i) + '">' + val + '</li>';
        });
        this._target.querySelector('.page-up').style.opacity = this.pageCurrent > 1 ? '1' : '.3';
        this._target.querySelector('.page-down').style.opacity = this.pageCurrent < this.pageCount ? '1' : '.3';
        this._resultTarget.innerHTML = html;
    },
    addChar: function (ch, obj) {
        if (this.pinyin.length == 0) {
            this.show(obj);
        }
        this.pinyin += ch;
        this.refresh();
    },
    delChar: function () {
        if (this.pinyin.length <= 1) {
            this.hide();
            return;
        }
        this.pinyin = this.pinyin.substr(0, this.pinyin.length - 1);
        this.refresh();
    },
    show: function (obj) {
        var pos = obj.getBoundingClientRect();
        this._target.style.left = pos.left + 'px';
        this._target.style.top = pos.top + pos.height + document.body.scrollTop + 'px';
        this._input = obj;
        this._target.style.display = 'block';
    },
    hide: function () {
        this.reset();
        this._target.style.display = 'none';
    },
    reset: function () {
        this.hanzi = '';
        this.pinyin = '';
        this.result = [];
        this.pageCurrent = 1;
        this.pageCount = 0;
        this._pinyinTarget.innerHTML = '';
    }
};

pinyinUtil.parseDict();
SimpleInputMethod.init('.test-input-method');