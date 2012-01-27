/**
 * @fileOverview 여러개의 js파일을 병렬로 다운로드 받을수 있는 컴퍼넌트
 * @name jsdynamic.load.xhr
 *
 * @author gunnymong@gmail.com
 * @version 0.1
 * @since 2011.02
 *
 * 테스트 브라우저 : IE6,IE7,IE8,Chrome,Opera,Safari,FF
 */


/**
 * @param {String}		: sUrl 로드할 js 파일 경로
 * @param {Function}	: fCallback js 파일 로드 완료후 실행할 콜백함수
 * @param {String}		: sCharset 문자셋 (default "utf-8", 생략 가능) 
 * 
 * XHR 형식으로 js 파일을 로드하게 되며 로드되는 상태 정보를 저장하는 queue 테이블과
 * onreadystatechange 이벤트를 사용하여 개발자가 원하는 대로 순차적으로 로드가 가능하며
 * 모든 js 파일이 로드된 후에는 include에 포함된 callback을 호출할수 있도록 설계 되어있다.
 * 
 * ## 주의 사항 : XHR 특성상 include 해야할 js 파일은 같은 도메인상에 위치해야 한다. ##
 */
jsDynamicLoad = {
	/**
	 * 현재 로드중인 js 파일 src,callback 저장 테이블
	 * @private
	 * @type {hashtable}
	 */
	_htLoadFile					: {},
	
	
	/**
	 * 현재 로드중인 js 파일의 상태 정보 저장 테이블
	 * @private
	 * @type {array}
	 */
	_aLoadFileQueue				: [],
	
	
	/**
	 * document head 정보
	 * @private
	 * @type {element}
	 */
	_elHead						: document.getElementsByTagName("head")[0],
	
	
	/**
	 * IE 브라우저 유무
	 * @private
	 * @type {boolean}
	 */
	_bIe						: (navigator.userAgent.toLowerCase().indexOf("msie") != -1) ? true : false,
	
	
	
	
	/**
	 * 지정된 js 파일 파싱을 위한 함수
	 *
	 * @param {String}		: sUrl 로드할 js 파일 경로
	 * @param {Function}	: fCallback js 파일 로드 완료후 실행할 콜백함수
	 * @param {String}		: sCharset 문자셋 (default "utf-8", 생략 가능)
	 *
	 * @private
	 * @type {function}
	 */
	include : function(sSrc,fCallback,sCharset) {
		var sScripturl = sSrc || null;
		var fCallback = fCallback || null;
		var sCharset = sCharset || "UTF-8";
		
		/**
		 * 1. 로드해야 하는 javascript 파일 src정보가 없는 경우 return 처리 하도록 한다.
		 */
		if (sScripturl == null) {
			return;
		}
		
		
		/**
		 * 2. include 하는 js 파일의 src정보 기준으로 테이블에 존재하지 않는것만 로드하도록 한다.
		 */
		if (this._htLoadFile[sScripturl] == null) {
			/**
			 * 2-1. 로딩되지 않은 js src정보를 저장하도록 한다.
			 */
			this._htLoadFile[sScripturl] = fCallback;
			
			
			/**
			 * 2-2. 새로 파싱되는 javascript 파일 상태 정보를 queue 테이블에 저장하도록 한다.
			 * - charset	: js 문자셋
			 * - response 	: xhr에서 응답된 정보를 저장한다.
			 * - done		: js 로드 완료 정보 (true/false)
			 * - src		: js src 정보
			 */
			var nQueueCount = this._aLoadFileQueue.length;
			this._aLoadFileQueue[nQueueCount] = {
											src				: sScripturl,
											charset			: sCharset,
											response		: null,
											done			: false
			};
			
			
			/**
			 * 2-3. XHR 사용하여 js 파일 로드
			 *
			 * onreadystatechange 이벤트 readyState가 변경될때마다 status가 완료 되었을때
			 * script tag를 추가함
			 */
			var self = this;
			var oXhr = this._loadXHR();
			oXhr.onreadystatechange = function() {
				if (oXhr.readyState == 4 && oXhr.status == 200) {
					self._aLoadFileQueue[nQueueCount].response = oXhr.responseText;
					self._createScriptTag();
				}
			};
			
			oXhr.open("GET",sScripturl);
			oXhr.send("");
		}
	},
	
	
	/**
	 * script tag 로드
	 *
	 * 현재까지 로드되고 있는 모든 js 파일의 상태 정보에서 로드 완료(done) 정보와
	 * 실제 XHR에서 받은 response 정보를 확인하여 head tag에 순차적으로 추가하도록 한다.
	 *
	 * @private
	 * @type {function}
	 */
	_createScriptTag : function() {
		var oLoadFileQue = null;
		for (var i=0,cnt=this._aLoadFileQueue.length;i<cnt;i++) {
			oLoadFileQue = this._aLoadFileQueue[i];
			
			if (!oLoadFileQue.done) {
				if (oLoadFileQue.response) {
					var oScript = document.createElement("script");
					oScript.type = "text/javascript";
					oScript.charset = oLoadFileQue.charset;
					oScript.text = oLoadFileQue.response;

					oLoadFileQue.done = true;
					
					this._elHead.appendChild(oScript);
					this._callBack(oScript,oLoadFileQue.src);
				} else {
					break;
				}
			}
		}
	},
	
	
	/**
	 * 로드된 js 파일 callback 처리
	 *
	 * @param script object 정보
	 * @param script src 정보
	 *
	 * @private
	 * @type {function}
	 */
	_callBack : function(oScript,sSrc) {
		var fCallback = this._htLoadFile[sSrc] || null;
		
		/**
		 * head에 append된 script의 양이 많은 경우 memory leak을 방지하기 위해 삭제 해야한다.
		 * 하지만 ie에서는 삭제하는경우 가끔 callback이 제대로 실행되지 않는 경우가 발생하므로
		 * 삭제 하지 않도록 한다.
		 */
		if (!this._bIe) {
			this._elHead.removeChild(oScript);
		}
		
		if (fCallback) {
			if (oScript.reasyState) {
				oScript.onreadystatechange = function() {
					if (oScript.readyState === "loaded" || oScript.readyState === "complete") {
						oScript.onload = fCallback();
						
						// ie에서 onreadystatechange 하지 않는 경우 memory leak 발생
						oScript.onreadystatechange = null;
					}
				};
			} else {
				oScript.onload = fCallback();
			}
		}
		
		// memory leak을 방지하기 위해 appenChild된 객체를 null처리 하도록 한다.
		oScript = null;
			
		return;
	},
	
	
	/**
	 * XHR Object Load
	 *
	 * @private
	 * @type {function}
	 */
	_loadXHR : function() {
		if (window.XMLHttpRequest) {
			return new XMLHttpRequest();
		} else if (ActiveXObject) {
			try { 
				return new ActiveXObject('MSXML2.XMLHTTP'); 
			} catch(e) {
				return new ActiveXObject('Microsoft.XMLHTTP'); 
			}
			
			return null;
		}
	}
};