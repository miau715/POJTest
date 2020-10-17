$.getJSON('./data/vocabulary.json', function(json) {
  const vObj = json;
  const vList = $('#vocabulary-list');
  const vLength = vObj.vocabulary.length;
  const vNumber = 5;
  const numArray = [...Array(vLength).keys()];
  let audioArray = [];
  let isStop = false;
  let vAudio;

  $('#test').on('click', function(){
    $('#audio-iframe').attr('src', '//t.moedict.tw/11169.ogg')
  });

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
          let thisVTPOJ = thisVTTL.replace(/(o)([^.!?,\w\s\u2011]*)o/ig, '$1$2\u0358')
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
          let thisVAudio = thisVObj.h[0]._;
          if (Number(thisVAudio) < 20000 || Number(thisVAudio) > 50000) {
            thisVAudio = (100000 + Number(thisVAudio)).toString().replace(/^1/, '');
          }
          audioArray[i] = thisVAudio;
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
          vAudio = new Audio(`http://t.moedict.tw/${audioArray[currentAudioI]}.ogg`);
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
    
          vAudio.addEventListener('ended', function() {
            vAudio.currentTime = 0;
            if (!isStop) {
              if (playTimes <= repeat - 1) {
                setTimeout(function(){
                  vAudio.play();
                  playTimes++;
                }, 3000);
              }
              else {
                if (currentAudioI < audioArray.length - 1) {
                  currentAudioI++;
                  playAudio(currentAudioI);
                }
              }
              if (currentAudioI === (vNumber - 1) && playTimes === repeat) {
                if (isEnd) {
                  setTimeout(function(){
                    $('#vocabulary-list').addClass('show');
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
      vAudio.pause();
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
});