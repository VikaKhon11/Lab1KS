//задані функції
const getFile = (fileInputEl) => {
  const fileReader = new FileReader();

  if ((fileInputEl.files[0] === undefined) | (fileInputEl.files[0] === null)) {
    return undefined;
  }

  fileReader.readAsText(fileInputEl.files[0]);

  return fileReader;
};
//розбиваємо на масив-підстрок
const countSymbol = (sym, textString) => {
  let count = 0;
  for (let i = 0; i < textString.length; i++) {
    if (textString[i].toLowerCase() === sym.toLowerCase()) {
      count++;
    }
  }
  return count;
};

const calcEntropy = (textString) => {
  const charCountObj = {};
  let entropyValue = 0;

  for (let i = 0; i < textString.length; i++) {
    if (!(textString[i] in charCountObj)) {
      charCountObj[textString[i]] = 0;
    }
    charCountObj[textString[i]]++;
  }

  for (let symb in charCountObj) {
    const symbCount = charCountObj[symb];
    const p = symbCount / textString.length;
    entropyValue -= p * Math.log2(p);
  }

  return entropyValue;
};
//константа представлення коду символів методу кодування base64 за utf-8
const getUTF8from6bitSymb = (b64symb) => {
  return b64symb < 26
    ? b64symb + 65
    : b64symb < 52
    ? b64symb + 71
    : b64symb < 62
    ? b64symb - 4
    : b64symb === 62
    ? 43
    : b64symb === 63
    ? 47
    : 65;
};
// utf-8 масив
const encodeBase64 = (utf8Arr) => {
  let outText = '';
  let value_24bit = 0;
  let index = 2;

  for (let i = 0; i < utf8Arr.length; i++) {
    index = i % 3;
//заповнюэмо 24 біт
    value_24bit = value_24bit + (utf8Arr[i] << ((16 >>> index) & 24));
    if (index === 2 || utf8Arr.length - i === 1) {
      outText += String.fromCodePoint(
        getUTF8from6bitSymb((value_24bit >>> 18) & 63),
        getUTF8from6bitSymb((value_24bit >>> 12) & 63),
        getUTF8from6bitSymb((value_24bit >>> 6) & 63),
        getUTF8from6bitSymb(value_24bit & 63),
      );
      //проводиться очистка 24 біт
      value_24bit = 0;
    }
  }

  return index === 2
    ? outText
    : index === 1
    ? outText.substring(0, outText.length - 1) + '='
    : outText.substring(0, outText.length - 2) + '==';
};
//лгоритм кодування UTF-8 стандартизований в RFC 3629 і складається з 3 етапів
const encodeToUTF8Arr = (textString) => {
  const values_for_octets = {
    _7bit: 128,
    _11bit: 2048,
    _16bit: 65536,
    _21bit: 2097152,
    _26bit: 67108864,
  };
  let outArr;
  let outArrLen = 0;

  for (let i = 0; i < textString.length; i++) {
    const char = textString[i].codePointAt();
    if (char >= 65536) {
      i++;
    }
    //Визначимо кількість байтів необхідних для коування символа
//діапазон номерів символів
    outArrLen =
      outArrLen +
      (char < values_for_octets['_7bit']
        ? 1
        : char < values_for_octets['_11bit']
        ? 2
        : char < values_for_octets['_16bit']
        ? 3
        : char < values_for_octets['_21bit']
        ? 4
        : char < values_for_octets['_26bit']
        ? 5
        : 6);
  }
  outArr = new Uint8Array(outArrLen);
// Встановити старші біти першого октету відповідно до необхідної кількості октетів:

  let arrIndex = 0;
  let j = 0;
  while (arrIndex < outArrLen) {
    const char = textString[j].codePointAt();
    if (char < values_for_octets['_7bit']) {
      outArr[arrIndex] = char;
      arrIndex++;
    } else if (char < values_for_octets['_11bit']) {
      outArr[arrIndex] = 192 + (char >>> 6);
      arrIndex++;
      outArr[arrIndex] = 128 + (char & 63);
      arrIndex++;
    } else if (char < values_for_octets['_16bit']) {
      outArr[arrIndex] = 224 + (char >>> 12);
      arrIndex++;
      outArr[arrIndex] = 128 + ((char >>> 6) & 63);
      arrIndex++;
      outArr[arrIndex] = 128 + (char & 63);
      arrIndex++;
    } else if (char < values_for_octets['_21bit']) {
      outArr[arrIndex] = 240 + (char >>> 18);
      arrIndex++;
      outArr[arrIndex] = 128 + ((char >>> 12) & 63);
      arrIndex++;
      outArr[arrIndex] = 128 + ((char >>> 6) & 63);
      arrIndex++;
      outArr[arrIndex] = 128 + (char & 63);
      arrIndex++;
      j++;
    } else if (char < values_for_octets['_26bit']) {
      outArr[arrIndex] = 248 + (char >>> 24);
      arrIndex++;
      outArr[arrIndex] = 128 + ((char >>> 18) & 63);
      arrIndex++;
      outArr[arrIndex] = 128 + ((char >>> 12) & 63);
      arrIndex++;
      outArr[arrIndex] = 128 + ((char >>> 6) & 63);
      arrIndex++;
      outArr[arrIndex] = 128 + (char & 63);
      arrIndex++;
      j++;
    } else {
      outArr[arrIndex] = 252 + (char >>> 30);
      arrIndex++;
      outArr[arrIndex] = 128 + ((char >>> 24) & 63);
      arrIndex++;
      outArr[arrIndex] = 128 + ((char >>> 18) & 63);
      arrIndex++;
      outArr[arrIndex] = 128 + ((char >>> 12) & 63);
      arrIndex++;
      outArr[arrIndex] = 128 + ((char >>> 6) & 63);
      arrIndex++;
      outArr[arrIndex] = 128 + (char & 63);
      arrIndex++;
      j++;
    }
    j++;
  }

  return outArr;
};
// константи які ми маємо обчислити частота, ентропія, кількість інформації
const symbP$ = document.querySelector('.symb_prob');
const entropy$ = document.querySelector('.text_entroy');
const infAm$ = document.querySelector('.text_infam');
const fsToInfAm$ = document.querySelector('.fsTOinfam');
const base64$ = document.querySelector('.base64_text');
const base64Entropy$ = document.querySelector('.base64_text_entroy');
const base64InfAm$ = document.querySelector('.base64_text_infam');
const symbInput = document.querySelector('.symbol-input');
const btn = document.querySelector('.calc-btn');
const fileInput = document.querySelector('.file-input');

btn.addEventListener('click', () => {
  const file = getFile(fileInput);

  if (!file) {
    alert('You need to pass TXT file');
    return;
  }
//завантажуємо файл, одразу отримуємо символ із вхідних даних
  file.onload = function () {
    const textData = file.result;
    const symbFromInput = symbInput.value;
    const dataLen = textData.length;
//якщо довжина =1,то обчислюємо вірогідність появи , ділимо кількість символа якого хочемо знайти на кількість всіх символів
    if (symbFromInput.length === 1) {
      const symbProb = countSymbol(symbFromInput, textData) / dataLen;
      symbP$.innerHTML += ` ${symbProb.toFixed(3)}`;
    }
// обчислимо ентропію
    const textEntropy = calcEntropy(textData);
    entropy$.innerHTML += ` ${textEntropy.toFixed(3)}`;
//обчислимо кі-сть інформації тексту
    const information_ammount = textEntropy * dataLen;
    infAm$.innerHTML += ` ${information_ammount.toFixed(3)}`;

    fsToInfAm$.innerHTML += ` ${(fileInput.files[0].size / (information_ammount / 8)).toFixed(3)}`;

    const utf8Arr = encodeToUTF8Arr(textData);
    const base64Code = encodeBase64(utf8Arr);

    base64$.innerHTML += base64Code;
   // обчислимо ентропію для base64
     const base64CodeEntropy = calcEntropy(base64Code);
    base64Entropy$.innerHTML += ` ${base64CodeEntropy.toFixed(3)}`;

    const base64_infAm = base64CodeEntropy * base64Code.length;

    base64InfAm$.innerHTML += ` ${base64_infAm.toFixed(3)}`;
  };
});
