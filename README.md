# Javascript Parallel Download Component


# 소개
>웹 서비스가 발전됨에 따라 페이지 내에서의 자바스크립 양이 점점 증가하고 있으며 그에 따라 페이지를 랜더링 지연 
>현상을 보이는데 이는 초기 로딩 속도 성능에 많은 영향을 미치고 있다. 그래서 웹 페이지 랜더링을 지연시키지 않고 
>스크립트를 병렬 다운로드 할수 있는 방법에 대해서 설명하려고 한다.


# 호환 브라우저
>`IE 6.0 이상`, `FireFox 3.0 이상`, `Safari 4.0 이상`, `Opera 10.0 이상`, `Chrome 2.0 이상`

# 사용방법
>## 적용
```<script type="text/javascript" src="jsDynamicLoad.min.js" charset="UTF-8"></script>```
>## API
jsDynamicLoad.include('js파일 src정보','callback 함수:생략가능','charset:생략한경우 기본적으로 "UTF-8"로 설정됩니다.');

```
  1. jsDynamicLoad.include("./js/test.js");

  2. jsDynamicLoad.include("./js/test.js",function(){
         alert("load complete");
     });
     * test.js 로드 완료 후에 실행하고 싶은 함수 정의 가능

  3. jsDynamicLoad.include("./js/test.js",null,"euc-kr");
     * test.js 파일의 문자셋을 "euc-kr"로 설정 가능

  4. jsDynamicLoad.include("./js/test.js",function(){
         setValue();
         resizeIframe();
     },"utf-8");
     * test.js 로드 완료 후에 파일안에 선언된 "setValue(),resizeIframe()" 호출 
       및 문자셋 "utf-8"로 설정 가능

  5. jsDynamicLoad.include("./js/test1.js");
     jsDynamicLoad.include("./js/test2.js");
     jsDynamicLoad.include("./js/test3.js",function(){
         alert("test3 load complete");
     });
     jsDynamicLoad.include("./js/test4.js",function(){
         setValue();
         resizeIframe();
     },"euc-kr");
     jsDynamicLoad.include("./js/test5.js");
     jsDynamicLoad.include("./js/test6.js",function(){
         alert("all js file load complete");
     });
     * 여러개의 js 파일을 include 된 순서대로 마크업 페이지에 파싱 하며 
       설정된 callback 순차대로 적용 가능

   * XHR형식으로 js 파일을 로드하므로 꼭 include하려는 js 파일은 
     같은 도메인상에 위치해야 합니다.
   * js src 정보를 입력하지 않는경우 return 처리 되므로 참고 하시길 바랍니다.
```