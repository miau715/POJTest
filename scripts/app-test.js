$.getJSON('./data/vocabulary-test.json', function(json) {
  const vObj = json;
  const vList = $('#vocabulary-list');
  const vLength = vObj.vocabulary.length;
  const vNumber = 5;
  const numArray = [...Array(vLength).keys()];
  let audioArray = [];
  let isStop = false;
  let vAudio;

  $('#start-test').on('click', function(){
    const repeat = 3;
    let isEnd = false;
    isStop = false;
    audioArray = [];
    vList.html('');
    vList.removeClass('show');
    $(this).addClass('hide');
    $('#end-test').addClass('show');

    // generate 10 random numbers   
    const randomNumArray = (arr, length) => {
      let newArr = arr;
      for (i = 0; i < length; i++) {
        let randomI = Math.floor(Math.random()*(arr.length));
        let itemAtI = newArr[randomI];

        newArr[randomI] = newArr[i];
        newArr[i] = itemAtI;
      }
      return newArr.slice(0, length);;
    }

    const randomIArray = randomNumArray(numArray, vNumber);

    randomIArray.forEach(function(number, i) {
      let getVocabulary = vObj.vocabulary[number]["v"];
      vList.append(`<li><div class="result-wrapper"><div class="result"><span class="han">${getVocabulary}</span></div><div class="link"><a href="https://www.moedict.tw/'${getVocabulary}" target="_blank"><span class="poj">Khòaⁿ jī-tián</span><span class="tl">Khuànn jī-tián</span><span class="han">看字典</span></a></div></div></li>`);
      $.ajax({
        url: `https://www.moedict.tw/t/${getVocabulary}.json`,
        dataType: 'json',
        success: function(result) {
          let thisVObj = result;
          let thisVTTL = result.h[0].T;
          let thisVTTLProns = thisVTTL.split('/');
          let thisVTPOJOrigin = '';
          thisVTTLProns.forEach(function(pron, i){
            if (i > 0) {
              thisVTPOJOrigin += '/';
            }
            thisVTPOJOrigin += pron.replace(/(o)([^.!?,\w\s\u2011]*)o/ig, '$1$2\u0358')
            .replace(/ts/g, 'ch')
            .replace(/Ts/g, 'Ch')
            .replace(/u([^‑-\w\s]*)a/g, 'o$1a')
            .replace(/u([^‑-\w\s]*)e/g, 'o$1e')
            .replace(/i([^‑-\w\s]*)k($|[-\s])/g, 'e$1k$2')
            .replace(/i([^‑-\w\s]*)ng/g, 'e$1ng')
            .replace(/nn($|[‑-\s])/g, 'ⁿ$1')
            .replace(/nnh($|[‑-\s])/g, 'hⁿ$1')
            .replace(/([ie])r/g, '$1\u0358')
            .replace(/\u030B/g, "\u0306"); // 9th tone
          });
          function tonePoj(poj){
            const toneReg = /([\u0300-\u0302\u0304\u0306\u0307\u030d])/;
            (toneReg).test(poj);
            let tone = RegExp.$1;
            if ((toneReg).test(poj)) {
              poj = ''.replace.call(poj, toneReg, '');
              if (/oa[inht]/i.exec(poj)) {
                return poj.replace(/(oa)([inht])/i, "$1" + tone + "$2");
              }
              if (/oe[h]/i.exec(poj)) {
                return poj.replace(/(oe)([h])/i, "$1" + tone + "$2");
              }
              if (/o/i.exec(poj)) {
                return poj.replace(/(o)/i, "$1" + tone);
              }
              if (/e/i.exec(poj)) {
                return poj.replace(/(e)/i, "$1" + tone);
              }
              if (/a/i.exec(poj)) {
                return poj.replace(/(a)/i, "$1" + tone);
              }
              if (/u/i.exec(poj)) {
                return poj.replace(/(u)/i, "$1" + tone);
              }
              if (/i/i.exec(poj)) {
                return poj.replace(/(i)/i, "$1" + tone);
              }
              if (/ng/i.exec(poj)) {
                return poj.replace(/(n)(g)/i, "$1" + tone + "$2");
              }
              if (/m/i.exec(poj)) {
                return poj.replace(/(m)/i, "$1" + tone);
              }
              return poj + "" + tone; //impossible
            }
            return poj;
          }
          let thisVTPOJ = '';
          thisVTPOJOrigin.split(/([- \u2011\.,!?\/])/).forEach(function(seg){
            thisVTPOJ += tonePoj(seg);
          });
          let thisVAudio = thisVObj.h[0]._;
          if (Number(thisVAudio) < 20000 || Number(thisVAudio) > 50000) {
            thisVAudio = (100000 + Number(thisVAudio)).toString().replace(/^1/, '');
          }
          audioArray[i] = thisVAudio;
          thisVTPOJ = thisVTPOJ.replace('/', '<span class="or">又</span>')
          thisVTTL = thisVTTL.replace('/', '<span class="or">又</span>')
          vList.find('li').eq(i).find('.result').prepend(`<span class="poj">${thisVTPOJ}</span><span class="tl">${thisVTTL}</span>`);
        }
      });
    });
  
    function playAudio(currentAudioI) {
      function checkFile() {
        if (!audioArray[currentAudioI]) {
          setTimeout(() => {
            checkFile();
          }, 1000); 
        }
        else {
          vAudio = new Howl({
            src: [`https://1763c5ee9859e0316ed6-db85b55a6a3fbe33f09b9245992383bd.ssl.cf1.rackcdn.com/${audioArray[currentAudioI]}.ogg`, `https://1763c5ee9859e0316ed6-db85b55a6a3fbe33f09b9245992383bd.ssl.cf1.rackcdn.com/${audioArray[currentAudioI]}.mp3`],
            html5: true
          });
          let playTimes = 0;
          if (!isStop) {
            if (currentAudioI === 0 && playTimes === 0) {
              vAudio.play();
              playTimes++;
            }
            else {
              setTimeout(function(){
                vAudio.play();
                playTimes++;
              }, 3000);
            }
          }
    
          vAudio.on('end', function(){
            if (!isStop) {
              if (playTimes < repeat) {
                setTimeout(function(){
                  vAudio.play();
                  playTimes++;
                }, 3000);
              }
              else if (currentAudioI < vNumber - 1) {
                currentAudioI++;
                playAudio(currentAudioI);
              }
              if (currentAudioI === (vNumber - 1) && playTimes === repeat) {
                if (isEnd) {
                  setTimeout(function(){
                    $('#vocabulary-list').addClass('show');
                    $('#start-test').removeClass('hide');
                    $('#end-test').removeClass('show');
                  }, 3000);
                }
                else {
                  isEnd = true;
                }
              }
            }
          }, false);
        }
      }
      checkFile();
    }
    playAudio(0);
  });

  $('#end-test').on('click', function(){
    isStop = window.confirm('Kám beh thêng?\n敢欲停？');
    if (isStop) {
      vAudio.stop();
      vAudio.unload();
      $(vAudio).attr('src', '');
      $('#vocabulary-list').addClass('show');
      $('#start-test').removeClass('hide');
      $('#end-test').removeClass('show');
    }
  });

  $('input[name=use-poj]').on('click', function() {
    if ($('input[name=use-poj]:checked').attr('id') === 'use-tl') {
      $('.poj').addClass('hide');
      $('.tl').addClass('show');
    }
    else {
      $('.poj').removeClass('hide');
      $('.tl').removeClass('show');
    }
  });

  $('#more-info').on('click', function(){
    $('body').addClass('info-modal__show');
  });

  $('.info-modal__close').on('click', function(){
    $('body').removeClass('info-modal__show');
  });

  $('body').on('click', function(e){
    if ($(this).hasClass('info-modal__show')) {
      if ($(e.target).parents('.info-modal').length === 0 
          && !$(e.target).hasClass('info-modal')
          && $(e.target).parents('#more-info').length === 0 ) {
        $('body').removeClass('info-modal__show');
      } 
    }
  });
});