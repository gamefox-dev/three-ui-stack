/**
 * GENERATED FILE — do not edit. Rebuild with `bun run build:yoga-asm`.
 *
 * Synchronous asm.js build of Yoga 3.2.1 (no WebAssembly required, Hermes-safe).
 * Source wasm sha256: 7ba9c9483c8c38a4…  Converted with binaryen 132.0.0 wasm2js.
 *
 * Yoga is Copyright (c) Meta Platforms, Inc. and affiliates and is licensed under the MIT license
 * (see THIRD_PARTY_NOTICES.md in the three-ui package).
 */
import wrapAssembly from './wrapAssembly.js'

// wasm2js output: `instantiate(info) → exports`
const instantiateAsm = (function () {
function instantiate(info) {
function Table(ret) {
  // grow method not included; table is not growable
  ret.set = function(i, func) {
    this[i] = func;
  };
  ret.get = function(i) {
    return this[i];
  };
  return ret;
}

  var bufferView;
  var base64ReverseLookup = new Uint8Array(123/*'z'+1*/);
  for (var i = 25; i >= 0; --i) {
    base64ReverseLookup[48+i] = 52+i; // '0-9'
    base64ReverseLookup[65+i] = i; // 'A-Z'
    base64ReverseLookup[97+i] = 26+i; // 'a-z'
  }
  base64ReverseLookup[43] = 62; // '+'
  base64ReverseLookup[47] = 63; // '/'
  /** @noinline Inlining this function would mean expanding the base64 string 4x times in the source code, which Closure seems to be happy to do. */
  function base64DecodeToExistingUint8Array(uint8Array, offset, b64) {
    var b1, b2, i = 0, j = offset, bLength = b64.length, end = offset + (bLength*3>>2) - (b64[bLength-2] == '=') - (b64[bLength-1] == '=');
    for (; i < bLength; i += 4) {
      b1 = base64ReverseLookup[b64.charCodeAt(i+1)];
      b2 = base64ReverseLookup[b64.charCodeAt(i+2)];
      uint8Array[j++] = base64ReverseLookup[b64.charCodeAt(i)] << 2 | b1 >> 4;
      if (j < end) uint8Array[j++] = b1 << 4 | b2 >> 2;
      if (j < end) uint8Array[j++] = b2 << 6 | base64ReverseLookup[b64.charCodeAt(i+3)];
    }
  }
function initActiveSegments(imports) {
  base64DecodeToExistingUint8Array(bufferView, 1024, "T25seSBsZWFmIG5vZGVzIHdpdGggY3VzdG9tIG1lYXN1cmUgZnVuY3Rpb25zIHNob3VsZCBtYW51YWxseSBtYXJrIHRoZW1zZWx2ZXMgYXMgZGlydHkAaXNEaXJ0eQBtYXJrRGlydHkAZGVzdHJveQBzZXREaXNwbGF5AGdldERpc3BsYXkAc2V0RmxleAAtKyAgIDBYMHgALTBYKzBYIDBYLTB4KzB4IDB4AHNldEZsZXhHcm93AGdldEZsZXhHcm93AHNldE92ZXJmbG93AGdldE92ZXJmbG93AGhhc05ld0xheW91dABjYWxjdWxhdGVMYXlvdXQAZ2V0Q29tcHV0ZWRMYXlvdXQAdW5zaWduZWQgc2hvcnQAZ2V0Q2hpbGRDb3VudAB1bnNpZ25lZCBpbnQAc2V0SnVzdGlmeUNvbnRlbnQAZ2V0SnVzdGlmeUNvbnRlbnQAYXZhaWxhYmxlSGVpZ2h0IGlzIGluZGVmaW5pdGUgc28gaGVpZ2h0U2l6aW5nTW9kZSBtdXN0IGJlIFNpemluZ01vZGU6Ok1heENvbnRlbnQAYXZhaWxhYmxlV2lkdGggaXMgaW5kZWZpbml0ZSBzbyB3aWR0aFNpemluZ01vZGUgbXVzdCBiZSBTaXppbmdNb2RlOjpNYXhDb250ZW50AHNldEFsaWduQ29udGVudABnZXRBbGlnbkNvbnRlbnQAZ2V0UGFyZW50AGltcGxlbWVudABzZXRNYXhIZWlnaHRQZXJjZW50AHNldEhlaWdodFBlcmNlbnQAc2V0TWluSGVpZ2h0UGVyY2VudABzZXRGbGV4QmFzaXNQZXJjZW50AHNldEdhcFBlcmNlbnQAc2V0UG9zaXRpb25QZXJjZW50AHNldE1hcmdpblBlcmNlbnQAc2V0TWF4V2lkdGhQZXJjZW50AHNldFdpZHRoUGVyY2VudABzZXRNaW5XaWR0aFBlcmNlbnQAc2V0UGFkZGluZ1BlcmNlbnQAaGFuZGxlLnR5cGUoKSA9PSBTdHlsZVZhbHVlSGFuZGxlOjpUeXBlOjpQb2ludCB8fCBoYW5kbGUudHlwZSgpID09IFN0eWxlVmFsdWVIYW5kbGU6OlR5cGU6OlBlcmNlbnQAY3JlYXRlRGVmYXVsdAB1bml0AHJpZ2h0AGhlaWdodABzZXRNYXhIZWlnaHQAZ2V0TWF4SGVpZ2h0AHNldEhlaWdodABnZXRIZWlnaHQAc2V0TWluSGVpZ2h0AGdldE1pbkhlaWdodABnZXRDb21wdXRlZEhlaWdodABnZXRDb21wdXRlZFJpZ2h0AGxlZnQAZ2V0Q29tcHV0ZWRMZWZ0AHJlc2V0AF9fZGVzdHJ1Y3QAZmxvYXQAdWludDY0X3QAdXNlV2ViRGVmYXVsdHMAc2V0VXNlV2ViRGVmYXVsdHMAc2V0QWxpZ25JdGVtcwBnZXRBbGlnbkl0ZW1zAHNldEZsZXhCYXNpcwBnZXRGbGV4QmFzaXMAQ2Fubm90IGdldCBsYXlvdXQgcHJvcGVydGllcyBvZiBtdWx0aS1lZGdlIHNob3J0aGFuZHMAc2V0UG9pbnRTY2FsZUZhY3RvcgBNZWFzdXJlQ2FsbGJhY2tXcmFwcGVyAERpcnRpZWRDYWxsYmFja1dyYXBwZXIAQ2Fubm90IHJlc2V0IGEgbm9kZSBzdGlsbCBhdHRhY2hlZCB0byBhIG93bmVyAHNldEJvcmRlcgBnZXRCb3JkZXIAZ2V0Q29tcHV0ZWRCb3JkZXIAZ2V0TnVtYmVyAGhhbmRsZS50eXBlKCkgPT0gU3R5bGVWYWx1ZUhhbmRsZTo6VHlwZTo6TnVtYmVyAHVuc2lnbmVkIGNoYXIAdG9wAGdldENvbXB1dGVkVG9wAHNldEZsZXhXcmFwAGdldEZsZXhXcmFwAHNldEdhcABnZXRHYXAAJXAAc2V0SGVpZ2h0QXV0bwBzZXRGbGV4QmFzaXNBdXRvAHNldFBvc2l0aW9uQXV0bwBzZXRNYXJnaW5BdXRvAHNldFdpZHRoQXV0bwBTY2FsZSBmYWN0b3Igc2hvdWxkIG5vdCBiZSBsZXNzIHRoYW4gemVybwBzZXRBc3BlY3RSYXRpbwBnZXRBc3BlY3RSYXRpbwBzZXRQb3NpdGlvbgBnZXRQb3NpdGlvbgBub3RpZnlPbkRlc3RydWN0aW9uAHNldEZsZXhEaXJlY3Rpb24AZ2V0RmxleERpcmVjdGlvbgBzZXREaXJlY3Rpb24AZ2V0RGlyZWN0aW9uAHNldE1hcmdpbgBnZXRNYXJnaW4AZ2V0Q29tcHV0ZWRNYXJnaW4AbWFya0xheW91dFNlZW4AbmFuAGJvdHRvbQBnZXRDb21wdXRlZEJvdHRvbQBib29sAGVtc2NyaXB0ZW46OnZhbABzZXRGbGV4U2hyaW5rAGdldEZsZXhTaHJpbmsAc2V0QWx3YXlzRm9ybXNDb250YWluaW5nQmxvY2sATWVhc3VyZUNhbGxiYWNrAERpcnRpZWRDYWxsYmFjawBnZXRMZW5ndGgAd2lkdGgAc2V0TWF4V2lkdGgAZ2V0TWF4V2lkdGgAc2V0V2lkdGgAZ2V0V2lkdGgAc2V0TWluV2lkdGgAZ2V0TWluV2lkdGgAZ2V0Q29tcHV0ZWRXaWR0aABwdXNoAC9ob21lL3J1bm5lci93b3JrL3lvZ2EveW9nYS9qYXZhc2NyaXB0Ly4uL3lvZ2Evc3R5bGUvU21hbGxWYWx1ZUJ1ZmZlci5oAC9ob21lL3J1bm5lci93b3JrL3lvZ2EveW9nYS9qYXZhc2NyaXB0Ly4uL3lvZ2Evc3R5bGUvU3R5bGVWYWx1ZVBvb2wuaAB1bnNpZ25lZCBsb25nAHNldEJveFNpemluZwBnZXRCb3hTaXppbmcAc3RkOjp3c3RyaW5nAHN0ZDo6c3RyaW5nAHN0ZDo6dTE2c3RyaW5nAHN0ZDo6dTMyc3RyaW5nAHNldFBhZGRpbmcAZ2V0UGFkZGluZwBnZXRDb21wdXRlZFBhZGRpbmcAVHJpZWQgdG8gY29uc3RydWN0IFlHTm9kZSB3aXRoIG51bGwgY29uZmlnAEF0dGVtcHRpbmcgdG8gY29uc3RydWN0IE5vZGUgd2l0aCBudWxsIGNvbmZpZwBjcmVhdGVXaXRoQ29uZmlnAGluZgBzZXRBbGlnblNlbGYAZ2V0QWxpZ25TZWxmAFNpemUAdmFsdWUAVmFsdWUAY3JlYXRlAG1lYXN1cmUAc2V0UG9zaXRpb25UeXBlAGdldFBvc2l0aW9uVHlwZQBpc1JlZmVyZW5jZUJhc2VsaW5lAHNldElzUmVmZXJlbmNlQmFzZWxpbmUAY29weVN0eWxlAGRvdWJsZQBOb2RlAGV4dGVuZABpbnNlcnRDaGlsZABnZXRDaGlsZAByZW1vdmVDaGlsZAB2b2lkAHNldEV4cGVyaW1lbnRhbEZlYXR1cmVFbmFibGVkAGlzRXhwZXJpbWVudGFsRmVhdHVyZUVuYWJsZWQAZGlydGllZABDYW5ub3QgcmVzZXQgYSBub2RlIHdoaWNoIHN0aWxsIGhhcyBjaGlsZHJlbiBhdHRhY2hlZAB1bnNldE1lYXN1cmVGdW5jAHVuc2V0RGlydGllZEZ1bmMAc2V0RXJyYXRhAGdldEVycmF0YQBNZWFzdXJlIGZ1bmN0aW9uIHJldHVybmVkIGFuIGludmFsaWQgZGltZW5zaW9uIHRvIFlvZ2E6IFt3aWR0aD0lZiwgaGVpZ2h0PSVmXQBFeHBlY3QgY3VzdG9tIGJhc2VsaW5lIGZ1bmN0aW9uIHRvIG5vdCByZXR1cm4gTmFOAE5BTgBJTkYAZW1zY3JpcHRlbjo6bWVtb3J5X3ZpZXc8c2hvcnQ+AGVtc2NyaXB0ZW46Om1lbW9yeV92aWV3PHVuc2lnbmVkIHNob3J0PgBlbXNjcmlwdGVuOjptZW1vcnlfdmlldzxpbnQ+AGVtc2NyaXB0ZW46Om1lbW9yeV92aWV3PHVuc2lnbmVkIGludD4AZW1zY3JpcHRlbjo6bWVtb3J5X3ZpZXc8ZmxvYXQ+AGVtc2NyaXB0ZW46Om1lbW9yeV92aWV3PHVpbnQ4X3Q+AGVtc2NyaXB0ZW46Om1lbW9yeV92aWV3PGludDhfdD4AZW1zY3JpcHRlbjo6bWVtb3J5X3ZpZXc8dWludDE2X3Q+AGVtc2NyaXB0ZW46Om1lbW9yeV92aWV3PGludDE2X3Q+AGVtc2NyaXB0ZW46Om1lbW9yeV92aWV3PHVpbnQzMl90PgBlbXNjcmlwdGVuOjptZW1vcnlfdmlldzxpbnQzMl90PgBlbXNjcmlwdGVuOjptZW1vcnlfdmlldzxjaGFyPgBlbXNjcmlwdGVuOjptZW1vcnlfdmlldzx1bnNpZ25lZCBjaGFyPgBzdGQ6OmJhc2ljX3N0cmluZzx1bnNpZ25lZCBjaGFyPgBlbXNjcmlwdGVuOjptZW1vcnlfdmlldzxzaWduZWQgY2hhcj4AZW1zY3JpcHRlbjo6bWVtb3J5X3ZpZXc8bG9uZz4AZW1zY3JpcHRlbjo6bWVtb3J5X3ZpZXc8dW5zaWduZWQgbG9uZz4AZW1zY3JpcHRlbjo6bWVtb3J5X3ZpZXc8ZG91YmxlPgBDaGlsZCBhbHJlYWR5IGhhcyBhIG93bmVyLCBpdCBtdXN0IGJlIHJlbW92ZWQgZmlyc3QuAENhbm5vdCBzZXQgbWVhc3VyZSBmdW5jdGlvbjogTm9kZXMgd2l0aCBtZWFzdXJlIGZ1bmN0aW9ucyBjYW5ub3QgaGF2ZSBjaGlsZHJlbi4AQ2Fubm90IGFkZCBjaGlsZDogTm9kZXMgd2l0aCBtZWFzdXJlIGZ1bmN0aW9ucyBjYW5ub3QgaGF2ZSBjaGlsZHJlbi4AKG51bGwpAGluZGV4IDwgNDA5NiAmJiAiU21hbGxWYWx1ZUJ1ZmZlciBjYW4gb25seSBob2xkIHVwIHRvIDQwOTYgY2h1bmtzIgAlcwoAAQAAAAMAAAAAAAAAAgAAAAMAAAABAAAAAgAAAAAAAAABAAAAAQ==");
  base64DecodeToExistingUint8Array(bufferView, 4876, "aWkAdgB2aQ==");
  base64DecodeToExistingUint8Array(bufferView, 4896, "ox0AAKEdAADhHQAA2x0AAOEdAADbHQAAaWlpZmlmaQDUHQAApB0AAHZpaQClHQAA6B0AAGlpaQ==");
  base64DecodeToExistingUint8Array(bufferView, 4960, "xAAAAMUAAADG");
  base64DecodeToExistingUint8Array(bufferView, 4980, "xAAAAMcAAADIAAAA1B0=");
  base64DecodeToExistingUint8Array(bufferView, 5008, "ox0AAOEdAADbHQAA4R0AANsdAADoHQAA4x0AAOgdAABpaWlpAAAAANQdAAC5HQAA1B0AALsdAAC8HQAA6B0=");
  base64DecodeToExistingUint8Array(bufferView, 5080, "yQAAAMoAAADL");
  base64DecodeToExistingUint8Array(bufferView, 5100, "yQAAAMwAAADIAAAAvx0AANQdAAC/HQ==");
  base64DecodeToExistingUint8Array(bufferView, 5136, "1B0AAL8dAADbHQAA1R0AAHZpaWlpAAAA1B0AAL8dAADhHQAAdmlpZgAAAADUHQAAvx0AANsdAAB2aWlpAAAAANQdAAC/HQAA1R0AANUdAADAHQAA2x0AANsdAADAHQAA1R0AAMAdAABpAGRpaQB2aWlkAADEHQAAxB0AAL8dAADUHQAAxB0AANQdAADEHQAAwx0AANQdAADEHQAA2x0AANQdAADEHQAA2x0AAOIdAAB2aWlpZAAAANQdAADEHQAA4h0AANsdAADFHQAAwh0AAMUdAADbHQAAwh0AAMUdAADiHQAAxR0AAOIdAADFHQAA2x0AAGRpaWkAAAAA4R0AAMQdAADbHQAAZmlpaQAAAADUHQAAxB0AAMQdAADcHQAA1B0AAMQdAADEHQAA3B0AAMUdAADEHQAAxB0AAMQdAADEHQAA3B0AANQdAADEHQAA1R0AANUdAADEHQAA1B0AAMQdAAChHQAA1B0AAMQdAAC5HQAA1R0AAMUdAAAAAAAA1B0AAMQdAADiHQAA4h0AANsdAAB2aWlkZGkAAMEdAADFHQ==");
  base64DecodeToExistingUint8Array(bufferView, 5568, "GQAKABkZGQAAAAAFAAAAAAAACQAAAAALAAAAAAAAAAAZABEKGRkZAwoHAAEACQsYAAAJBgsAAAsABhkAAAAZGRk=");
  base64DecodeToExistingUint8Array(bufferView, 5649, "DgAAAAAAAAAAGQAKDRkZGQANAAACAAkOAAAACQAOAAAO");
  base64DecodeToExistingUint8Array(bufferView, 5707, "DA==");
  base64DecodeToExistingUint8Array(bufferView, 5719, "EwAAAAATAAAAAAkMAAAAAAAMAAAM");
  base64DecodeToExistingUint8Array(bufferView, 5765, "EA==");
  base64DecodeToExistingUint8Array(bufferView, 5777, "DwAAAAQPAAAAAAkQAAAAAAAQAAAQ");
  base64DecodeToExistingUint8Array(bufferView, 5823, "Eg==");
  base64DecodeToExistingUint8Array(bufferView, 5835, "EQAAAAARAAAAAAkSAAAAAAASAAASAAAaAAAAGhoa");
  base64DecodeToExistingUint8Array(bufferView, 5890, "GgAAABoaGgAAAAAAAAk=");
  base64DecodeToExistingUint8Array(bufferView, 5939, "FA==");
  base64DecodeToExistingUint8Array(bufferView, 5951, "FwAAAAAXAAAAAAkUAAAAAAAUAAAU");
  base64DecodeToExistingUint8Array(bufferView, 5997, "Fg==");
  base64DecodeToExistingUint8Array(bufferView, 6009, "FQAAAAAVAAAAAAkWAAAAAAAWAAAWAAAwMTIzNDU2Nzg5QUJDREVG");
  base64DecodeToExistingUint8Array(bufferView, 6084, "0g==");
  base64DecodeToExistingUint8Array(bufferView, 6124, "//////////8=");
  base64DecodeToExistingUint8Array(bufferView, 6192, "ECIBAAAAAAAF");
  base64DecodeToExistingUint8Array(bufferView, 6212, "zQ==");
  base64DecodeToExistingUint8Array(bufferView, 6236, "zgAAAM8AAAD8HQ==");
  base64DecodeToExistingUint8Array(bufferView, 6260, "Ag==");
  base64DecodeToExistingUint8Array(bufferView, 6276, "//////////8=");
  base64DecodeToExistingUint8Array(bufferView, 6344, "BQ==");
  base64DecodeToExistingUint8Array(bufferView, 6356, "0A==");
  base64DecodeToExistingUint8Array(bufferView, 6380, "zgAAANEAAAAIHgAAAAQ=");
  base64DecodeToExistingUint8Array(bufferView, 6404, "AQ==");
  base64DecodeToExistingUint8Array(bufferView, 6420, "/////wo=");
  base64DecodeToExistingUint8Array(bufferView, 6488, "0w==");
}

  var scratchBuffer = new ArrayBuffer(16);
  var i32ScratchView = new Int32Array(scratchBuffer);
  var f32ScratchView = new Float32Array(scratchBuffer);
  var f64ScratchView = new Float64Array(scratchBuffer);
  
  function wasm2js_scratch_load_i32(index) {
    return i32ScratchView[index];
  }
      
  function wasm2js_scratch_store_i32(index, value) {
    i32ScratchView[index] = value;
  }
      
  function wasm2js_scratch_load_f64() {
    return f64ScratchView[0];
  }
      
  function wasm2js_scratch_store_f64(value) {
    f64ScratchView[0] = value;
  }
      function wasm2js_trap() { throw new Error('abort'); }

  function wasm2js_scratch_load_f32() {
    return f32ScratchView[2];
  }
      
function asmFunc(imports) {
 var buffer = new ArrayBuffer(16777216);
 var HEAP8 = new Int8Array(buffer);
 var HEAP16 = new Int16Array(buffer);
 var HEAP32 = new Int32Array(buffer);
 var HEAPU8 = new Uint8Array(buffer);
 var HEAPU16 = new Uint16Array(buffer);
 var HEAPU32 = new Uint32Array(buffer);
 var HEAPF32 = new Float32Array(buffer);
 var HEAPF64 = new Float64Array(buffer);
 var Math_imul = Math.imul;
 var Math_fround = Math.fround;
 var Math_abs = Math.abs;
 var Math_clz32 = Math.clz32;
 var Math_min = Math.min;
 var Math_max = Math.max;
 var Math_floor = Math.floor;
 var Math_ceil = Math.ceil;
 var Math_trunc = Math.trunc;
 var Math_sqrt = Math.sqrt;
 var a = imports.a;
 var fimport$0 = a.a;
 var fimport$1 = a.b;
 var fimport$2 = a.c;
 var fimport$3 = a.d;
 var fimport$4 = a.e;
 var fimport$5 = a.f;
 var fimport$6 = a.g;
 var fimport$7 = a.h;
 var fimport$8 = a.i;
 var fimport$9 = a.j;
 var fimport$10 = a.k;
 var fimport$11 = a.l;
 var fimport$12 = a.m;
 var fimport$13 = a.n;
 var fimport$14 = a.o;
 var fimport$15 = a.p;
 var fimport$16 = a.q;
 var fimport$17 = a.r;
 var fimport$18 = a.s;
 var fimport$19 = a.t;
 var fimport$20 = a.u;
 var fimport$21 = a.v;
 var fimport$22 = a.w;
 var fimport$23 = a.x;
 var fimport$24 = a.y;
 var fimport$25 = a.z;
 var fimport$26 = a.A;
 var fimport$27 = a.B;
 var fimport$28 = a.C;
 var fimport$29 = a.D;
 var global$0 = 74256;
 var i64toi32_i32$HIGH_BITS = 0;
 // EMSCRIPTEN_START_FUNCS
;
 function $0($0_1) {
  var $1_1 = 0;
  $0_1 = $0_1 ? $0_1 : 1;
  block : {
   while (1) {
    $1_1 = $67($0_1);
    if ($1_1) {
     break block
    }
    $1_1 = HEAP32[2178];
    if ($1_1) {
     FUNCTION_TABLE[$1_1 | 0]();
     continue;
    }
    break;
   };
   fimport$2();
   wasm2js_trap();
  }
  return $1_1;
 }
 
 function $1($0_1, $1_1, $2_1) {
  var $3_1 = Math_fround(0), $4_1 = Math_fround(0), $5_1 = 0, $6_1 = 0, $7_1 = 0;
  $4_1 = Math_fround(NaN);
  block3 : {
   block : {
    block1 : {
     block2 : {
      $5_1 = $2_1 & 7;
      switch ($5_1 | 0) {
      case 0:
       break block;
      case 4:
       break block2;
      default:
       break block1;
      };
     }
     $6_1 = 3;
     break block;
    }
    if ($5_1 - 1 >>> 0 >= 2) {
     break block3
    }
    $7_1 = ($2_1 & 65520) >>> 4 | 0;
    block4 : {
     if ($2_1 & 8) {
      $3_1 = (wasm2js_scratch_store_i32(2, $128($1_1, $7_1)), wasm2js_scratch_load_f32());
      break block4;
     }
     $1_1 = $7_1 & 2047;
     $3_1 = Math_fround(($2_1 << 16 >> 16 < 0 ? 0 - $1_1 | 0 : $1_1) | 0);
    }
    if (($5_1 | 0) == 1) {
     if ($3_1 != $3_1) {
      break block
     }
     $1_1 = $3_1 == Math_fround(Infinity) | $3_1 == Math_fround(-Infinity);
     $4_1 = $1_1 ? Math_fround(NaN) : $3_1;
     $6_1 = !$1_1;
     break block;
    }
    if ($3_1 != $3_1) {
     break block
    }
    $1_1 = $3_1 == Math_fround(Infinity) | $3_1 == Math_fround(-Infinity);
    $6_1 = $1_1 ? 0 : 2;
    $4_1 = $1_1 ? Math_fround(NaN) : $3_1;
   }
   HEAP8[$0_1 + 4 | 0] = $6_1;
   HEAPF32[$0_1 >> 2] = $4_1;
   return;
  }
  fimport$11(1780, 3113, 58, 2937);
  wasm2js_trap();
 }
 
 function $2($0_1, $1_1) {
  var $2_1 = Math_fround(0), $3_1 = 0;
  $2_1 = Math_fround(NaN);
  block : {
   switch ($1_1 & 7) {
   default:
    fimport$11(2372, 3113, 73, 2362);
    wasm2js_trap();
   case 3:
    $3_1 = ($1_1 & 65520) >>> 4 | 0;
    if ($1_1 & 8) {
     return wasm2js_scratch_store_i32(2, $128($0_1, $3_1)), wasm2js_scratch_load_f32()
    }
    $0_1 = $3_1 & 2047;
    $2_1 = Math_fround(($1_1 << 16 >> 16 < 0 ? 0 - $0_1 | 0 : $0_1) | 0);
    break;
   case 0:
    break block;
   };
  }
  return $2_1;
 }
 
 function $3($0_1, $1_1, $2_1, $3_1) {
  var $4_1 = 0, $5_1 = Math_fround(0);
  $4_1 = global$0 - 16 | 0;
  global$0 = $4_1;
  $10($4_1 + 8 | 0, $0_1, ($1_1 & 254) != 2 ? 3 : (($2_1 | 0) != 2) << 1, $2_1);
  $5_1 = Math_fround(NaN);
  block2 : {
   block1 : {
    switch (HEAPU8[$4_1 + 12 | 0] - 1 | 0) {
    case 0:
     $5_1 = HEAPF32[$4_1 + 8 >> 2];
     break block2;
    case 1:
     break block1;
    default:
     break block2;
    };
   }
   $5_1 = Math_fround(Math_fround(HEAPF32[$4_1 + 8 >> 2] * $3_1) * Math_fround(.009999999776482582));
  }
  global$0 = $4_1 + 16 | 0;
  return $5_1 == $5_1 ? $5_1 : Math_fround(0.0);
 }
 
 function $4($0_1, $1_1, $2_1, $3_1) {
  var $4_1 = 0, $5_1 = Math_fround(0);
  $4_1 = global$0 - 16 | 0;
  global$0 = $4_1;
  $10($4_1 + 8 | 0, $0_1, ($1_1 & 254) != 2 ? 1 : (($2_1 | 0) == 2) << 1, $2_1);
  $5_1 = Math_fround(NaN);
  block2 : {
   block1 : {
    switch (HEAPU8[$4_1 + 12 | 0] - 1 | 0) {
    case 0:
     $5_1 = HEAPF32[$4_1 + 8 >> 2];
     break block2;
    case 1:
     break block1;
    default:
     break block2;
    };
   }
   $5_1 = Math_fround(Math_fround(HEAPF32[$4_1 + 8 >> 2] * $3_1) * Math_fround(.009999999776482582));
  }
  global$0 = $4_1 + 16 | 0;
  return $5_1 == $5_1 ? $5_1 : Math_fround(0.0);
 }
 
 function $5($0_1) {
  $0_1 = $0_1 | 0;
  var $1_1 = 0, $2_1 = 0, $3_1 = 0, $4_1 = 0, $5_1 = 0;
  if ($0_1) {
   $1_1 = $0_1 - 4 | 0;
   $4_1 = HEAP32[$1_1 >> 2];
   $3_1 = $4_1;
   $2_1 = $1_1;
   $5_1 = HEAP32[$0_1 - 8 >> 2];
   $0_1 = $5_1 & -2;
   if (($0_1 | 0) != ($5_1 | 0)) {
    $2_1 = $1_1 - $0_1 | 0;
    $5_1 = HEAP32[$2_1 + 4 >> 2];
    HEAP32[$5_1 + 8 >> 2] = HEAP32[$2_1 + 8 >> 2];
    HEAP32[HEAP32[$2_1 + 8 >> 2] + 4 >> 2] = $5_1;
    $3_1 = $0_1 + $3_1 | 0;
   }
   $0_1 = $1_1 + $4_1 | 0;
   $1_1 = HEAP32[$0_1 >> 2];
   if (($1_1 | 0) != HEAP32[($0_1 + $1_1 | 0) - 4 >> 2]) {
    $4_1 = HEAP32[$0_1 + 4 >> 2];
    HEAP32[$4_1 + 8 >> 2] = HEAP32[$0_1 + 8 >> 2];
    HEAP32[HEAP32[$0_1 + 8 >> 2] + 4 >> 2] = $4_1;
    $3_1 = $1_1 + $3_1 | 0;
   }
   HEAP32[$2_1 >> 2] = $3_1;
   HEAP32[(($3_1 & -4) + $2_1 | 0) - 4 >> 2] = $3_1 | 1;
   $1_1 = HEAP32[$2_1 >> 2] - 8 | 0;
   block : {
    if ($1_1 >>> 0 <= 127) {
     $0_1 = ($1_1 >>> 3 | 0) - 1 | 0;
     break block;
    }
    $3_1 = Math_clz32($1_1);
    $0_1 = (($1_1 >>> 29 - $3_1 ^ 4) - ($3_1 << 2) | 0) + 110 | 0;
    if ($1_1 >>> 0 <= 4095) {
     break block
    }
    $0_1 = (($1_1 >>> 30 - $3_1 ^ 2) - ($3_1 << 1) | 0) + 71 | 0;
    $0_1 = $0_1 >>> 0 >= 63 ? 63 : $0_1;
   }
   $1_1 = $0_1 << 4;
   HEAP32[$2_1 + 4 >> 2] = $1_1 + 6496;
   $1_1 = $1_1 + 6504 | 0;
   HEAP32[$2_1 + 8 >> 2] = HEAP32[$1_1 >> 2];
   HEAP32[$1_1 >> 2] = $2_1;
   HEAP32[HEAP32[$2_1 + 8 >> 2] + 4 >> 2] = $2_1;
   $1_1 = HEAP32[1882];
   $3_1 = HEAP32[1883];
   $2_1 = $0_1 & 31;
   if (($0_1 & 63) >>> 0 >= 32) {
    $0_1 = 1 << $2_1;
    $4_1 = 0;
   } else {
    $4_1 = 1 << $2_1;
    $0_1 = $4_1 - 1 & 1 >>> 32 - $2_1;
   }
   HEAP32[1882] = $4_1 | $1_1;
   HEAP32[1883] = $0_1 | $3_1;
  }
 }
 
 function $6() {
  FUNCTION_TABLE[HEAP32[1622]]();
  $58();
  wasm2js_trap();
 }
 
 function $7($0_1, $1_1, $2_1, $3_1, $4_1, $5_1) {
  var $6_1 = Math_fround(0), $7_1 = 0, $8_1 = 0;
  $7_1 = $0_1 + 20 | 0;
  $8_1 = $1_1 >>> 0 < 2;
  $6_1 = $23($7_1, $2_1, $8_1, $4_1, $5_1);
  $4_1 = $15($7_1, $2_1, $8_1, $4_1, $5_1);
  block : {
   if ($4_1 >= Math_fround(0.0) & $3_1 > $4_1) {
    break block
   }
   if (!($6_1 >= Math_fround(0.0))) {
    $4_1 = $3_1;
    break block;
   }
   $4_1 = $3_1 < $6_1 ? $6_1 : $3_1;
  }
  $0_1 = $0_1 + 20 | 0;
  $3_1 = Math_fround(Math_fround($26($0_1, $1_1, $2_1, $5_1) + $18($0_1, $1_1, $2_1)) + Math_fround($25($0_1, $1_1, $2_1, $5_1) + $17($0_1, $1_1, $2_1)));
  return $4_1 == $4_1 & $3_1 == $3_1 ? ($3_1 > $4_1 ? $3_1 : $4_1) : $4_1 != $4_1 ? $3_1 : $4_1;
 }
 
 function $8($0_1, $1_1, $2_1) {
  var $3_1 = 0, $4_1 = 0, $5_1 = 0;
  if (!(HEAPU8[$0_1 | 0] & 32)) {
   block1 : {
    $3_1 = $1_1;
    $1_1 = $0_1;
    $0_1 = HEAP32[$1_1 + 16 >> 2];
    block : {
     if (!$0_1) {
      if ($127($1_1)) {
       break block
      }
      $0_1 = HEAP32[$1_1 + 16 >> 2];
     }
     $5_1 = HEAP32[$1_1 + 20 >> 2];
     if ($0_1 - $5_1 >>> 0 < $2_1 >>> 0) {
      FUNCTION_TABLE[HEAP32[$1_1 + 36 >> 2]]($1_1, $3_1, $2_1) | 0;
      break block1;
     }
     block2 : {
      if (HEAP32[$1_1 + 80 >> 2] < 0) {
       break block2
      }
      $0_1 = $2_1;
      while (1) {
       $4_1 = $0_1;
       if (!$0_1) {
        break block2
       }
       $0_1 = $0_1 - 1 | 0;
       if (HEAPU8[$3_1 + $0_1 | 0] != 10) {
        continue
       }
       break;
      };
      if (FUNCTION_TABLE[HEAP32[$1_1 + 36 >> 2]]($1_1, $3_1, $4_1) >>> 0 < $4_1 >>> 0) {
       break block
      }
      $3_1 = $3_1 + $4_1 | 0;
      $2_1 = $2_1 - $4_1 | 0;
      $5_1 = HEAP32[$1_1 + 20 >> 2];
     }
     $13($5_1, $3_1, $2_1);
     HEAP32[$1_1 + 20 >> 2] = HEAP32[$1_1 + 20 >> 2] + $2_1;
    }
   }
  }
 }
 
 function $10($0_1, $1_1, $2_1, $3_1) {
  block : {
   switch ($2_1 | 0) {
   case 1:
    $37($0_1, $1_1, $1_1 + 12 | 0);
    return;
   case 2:
    $38($0_1, $1_1, $1_1 + 12 | 0, $3_1);
    return;
   case 3:
    $36($0_1, $1_1, $1_1 + 12 | 0);
    return;
   default:
    $6();
    wasm2js_trap();
   case 0:
    break block;
   };
  }
  $39($0_1, $1_1, $1_1 + 12 | 0, $3_1);
 }
 
 function $11($0_1, $1_1, $2_1, $3_1, $4_1) {
  var $5_1 = 0;
  $5_1 = global$0 - 256 | 0;
  global$0 = $5_1;
  if (!($4_1 & 73728 | ($2_1 | 0) <= ($3_1 | 0))) {
   $3_1 = $2_1 - $3_1 | 0;
   $2_1 = $3_1 >>> 0 < 256;
   $12($5_1, $1_1 & 255, $2_1 ? $3_1 : 256);
   if (!$2_1) {
    while (1) {
     $8($0_1, $5_1, 256);
     $3_1 = $3_1 - 256 | 0;
     if ($3_1 >>> 0 > 255) {
      continue
     }
     break;
    }
   }
   $8($0_1, $5_1, $3_1);
  }
  global$0 = $5_1 + 256 | 0;
 }
 
 function $12($0_1, $1_1, $2_1) {
  var $3_1 = 0, $4_1 = 0, $5_1 = 0, $6_1 = 0;
  block : {
   if (!$2_1) {
    break block
   }
   HEAP8[$0_1 | 0] = $1_1;
   $3_1 = $0_1 + $2_1 | 0;
   HEAP8[$3_1 - 1 | 0] = $1_1;
   if ($2_1 >>> 0 < 3) {
    break block
   }
   HEAP8[$0_1 + 2 | 0] = $1_1;
   HEAP8[$0_1 + 1 | 0] = $1_1;
   HEAP8[$3_1 - 3 | 0] = $1_1;
   HEAP8[$3_1 - 2 | 0] = $1_1;
   if ($2_1 >>> 0 < 7) {
    break block
   }
   HEAP8[$0_1 + 3 | 0] = $1_1;
   HEAP8[$3_1 - 4 | 0] = $1_1;
   if ($2_1 >>> 0 < 9) {
    break block
   }
   $3_1 = 0 - $0_1 & 3;
   $4_1 = $3_1 + $0_1 | 0;
   $1_1 = Math_imul($1_1 & 255, 16843009);
   HEAP32[$4_1 >> 2] = $1_1;
   $3_1 = $2_1 - $3_1 & -4;
   $2_1 = $3_1 + $4_1 | 0;
   HEAP32[$2_1 - 4 >> 2] = $1_1;
   if ($3_1 >>> 0 < 9) {
    break block
   }
   HEAP32[$4_1 + 8 >> 2] = $1_1;
   HEAP32[$4_1 + 4 >> 2] = $1_1;
   HEAP32[$2_1 - 8 >> 2] = $1_1;
   HEAP32[$2_1 - 12 >> 2] = $1_1;
   if ($3_1 >>> 0 < 25) {
    break block
   }
   HEAP32[$4_1 + 24 >> 2] = $1_1;
   HEAP32[$4_1 + 20 >> 2] = $1_1;
   HEAP32[$4_1 + 16 >> 2] = $1_1;
   HEAP32[$4_1 + 12 >> 2] = $1_1;
   HEAP32[$2_1 - 16 >> 2] = $1_1;
   HEAP32[$2_1 - 20 >> 2] = $1_1;
   HEAP32[$2_1 - 24 >> 2] = $1_1;
   HEAP32[$2_1 - 28 >> 2] = $1_1;
   $6_1 = $4_1 & 4 | 24;
   $2_1 = $3_1 - $6_1 | 0;
   if ($2_1 >>> 0 < 32) {
    break block
   }
   $3_1 = __wasm_i64_mul($1_1, 0, 1, 1);
   $5_1 = i64toi32_i32$HIGH_BITS;
   $1_1 = $4_1 + $6_1 | 0;
   while (1) {
    HEAP32[$1_1 + 24 >> 2] = $3_1;
    HEAP32[$1_1 + 28 >> 2] = $5_1;
    HEAP32[$1_1 + 16 >> 2] = $3_1;
    HEAP32[$1_1 + 20 >> 2] = $5_1;
    HEAP32[$1_1 + 8 >> 2] = $3_1;
    HEAP32[$1_1 + 12 >> 2] = $5_1;
    HEAP32[$1_1 >> 2] = $3_1;
    HEAP32[$1_1 + 4 >> 2] = $5_1;
    $1_1 = $1_1 + 32 | 0;
    $2_1 = $2_1 - 32 | 0;
    if ($2_1 >>> 0 > 31) {
     continue
    }
    break;
   };
  }
  return $0_1;
 }
 
 function $13($0_1, $1_1, $2_1) {
  var $3_1 = 0, $4_1 = 0, $5_1 = 0;
  if ($2_1 >>> 0 >= 512) {
   fimport$23($0_1 | 0, $1_1 | 0, $2_1 | 0);
   return $0_1;
  }
  $4_1 = $0_1 + $2_1 | 0;
  block2 : {
   if (!(($0_1 ^ $1_1) & 3)) {
    block : {
     if (!($0_1 & 3)) {
      $2_1 = $0_1;
      break block;
     }
     if (!$2_1) {
      $2_1 = $0_1;
      break block;
     }
     $2_1 = $0_1;
     while (1) {
      HEAP8[$2_1 | 0] = HEAPU8[$1_1 | 0];
      $1_1 = $1_1 + 1 | 0;
      $2_1 = $2_1 + 1 | 0;
      if (!($2_1 & 3)) {
       break block
      }
      if ($2_1 >>> 0 < $4_1 >>> 0) {
       continue
      }
      break;
     };
    }
    $3_1 = $4_1 & -4;
    block1 : {
     if ($3_1 >>> 0 < 64) {
      break block1
     }
     $5_1 = $3_1 + -64 | 0;
     if ($5_1 >>> 0 < $2_1 >>> 0) {
      break block1
     }
     while (1) {
      HEAP32[$2_1 >> 2] = HEAP32[$1_1 >> 2];
      HEAP32[$2_1 + 4 >> 2] = HEAP32[$1_1 + 4 >> 2];
      HEAP32[$2_1 + 8 >> 2] = HEAP32[$1_1 + 8 >> 2];
      HEAP32[$2_1 + 12 >> 2] = HEAP32[$1_1 + 12 >> 2];
      HEAP32[$2_1 + 16 >> 2] = HEAP32[$1_1 + 16 >> 2];
      HEAP32[$2_1 + 20 >> 2] = HEAP32[$1_1 + 20 >> 2];
      HEAP32[$2_1 + 24 >> 2] = HEAP32[$1_1 + 24 >> 2];
      HEAP32[$2_1 + 28 >> 2] = HEAP32[$1_1 + 28 >> 2];
      HEAP32[$2_1 + 32 >> 2] = HEAP32[$1_1 + 32 >> 2];
      HEAP32[$2_1 + 36 >> 2] = HEAP32[$1_1 + 36 >> 2];
      HEAP32[$2_1 + 40 >> 2] = HEAP32[$1_1 + 40 >> 2];
      HEAP32[$2_1 + 44 >> 2] = HEAP32[$1_1 + 44 >> 2];
      HEAP32[$2_1 + 48 >> 2] = HEAP32[$1_1 + 48 >> 2];
      HEAP32[$2_1 + 52 >> 2] = HEAP32[$1_1 + 52 >> 2];
      HEAP32[$2_1 + 56 >> 2] = HEAP32[$1_1 + 56 >> 2];
      HEAP32[$2_1 + 60 >> 2] = HEAP32[$1_1 + 60 >> 2];
      $1_1 = $1_1 - -64 | 0;
      $2_1 = $2_1 - -64 | 0;
      if ($5_1 >>> 0 >= $2_1 >>> 0) {
       continue
      }
      break;
     };
    }
    if ($2_1 >>> 0 >= $3_1 >>> 0) {
     break block2
    }
    while (1) {
     HEAP32[$2_1 >> 2] = HEAP32[$1_1 >> 2];
     $1_1 = $1_1 + 4 | 0;
     $2_1 = $2_1 + 4 | 0;
     if ($3_1 >>> 0 > $2_1 >>> 0) {
      continue
     }
     break;
    };
    break block2;
   }
   if ($4_1 >>> 0 < 4) {
    $2_1 = $0_1;
    break block2;
   }
   $3_1 = $4_1 - 4 | 0;
   if ($3_1 >>> 0 < $0_1 >>> 0) {
    $2_1 = $0_1;
    break block2;
   }
   $2_1 = $0_1;
   while (1) {
    HEAP8[$2_1 | 0] = HEAPU8[$1_1 | 0];
    HEAP8[$2_1 + 1 | 0] = HEAPU8[$1_1 + 1 | 0];
    HEAP8[$2_1 + 2 | 0] = HEAPU8[$1_1 + 2 | 0];
    HEAP8[$2_1 + 3 | 0] = HEAPU8[$1_1 + 3 | 0];
    $1_1 = $1_1 + 4 | 0;
    $2_1 = $2_1 + 4 | 0;
    if ($3_1 >>> 0 >= $2_1 >>> 0) {
     continue
    }
    break;
   };
  }
  if ($2_1 >>> 0 < $4_1 >>> 0) {
   while (1) {
    HEAP8[$2_1 | 0] = HEAPU8[$1_1 | 0];
    $1_1 = $1_1 + 1 | 0;
    $2_1 = $2_1 + 1 | 0;
    if (($4_1 | 0) != ($2_1 | 0)) {
     continue
    }
    break;
   }
  }
  return $0_1;
 }
 
 function $14($0_1, $1_1, $2_1, $3_1) {
  var $4_1 = 0;
  $4_1 = global$0 - 16 | 0;
  global$0 = $4_1;
  HEAP32[$4_1 + 12 >> 2] = $3_1;
  block : {
   if (!$0_1) {
    $83(0, 0, $1_1, $2_1, HEAP32[$4_1 + 12 >> 2]);
    break block;
   }
   $83(HEAP32[$0_1 + 500 >> 2], $0_1, $1_1, $2_1, HEAP32[$4_1 + 12 >> 2]);
  }
  global$0 = $4_1 + 16 | 0;
 }
 
 function $15($0_1, $1_1, $2_1, $3_1, $4_1) {
  var $5_1 = 0, $6_1 = Math_fround(0);
  $5_1 = global$0 - 16 | 0;
  global$0 = $5_1;
  $1($5_1 + 8 | 0, $0_1 + 104 | 0, HEAPU16[(($2_1 << 1) + $0_1 | 0) + 98 >> 1]);
  $6_1 = Math_fround(NaN);
  block2 : {
   block1 : {
    switch (HEAPU8[$5_1 + 12 | 0] - 1 | 0) {
    case 0:
     $6_1 = HEAPF32[$5_1 + 8 >> 2];
     break block2;
    case 1:
     break block1;
    default:
     break block2;
    };
   }
   $6_1 = Math_fround(Math_fround(HEAPF32[$5_1 + 8 >> 2] * $3_1) * Math_fround(.009999999776482582));
  }
  if (HEAPU8[$0_1 + 3 | 0] << 16 & 1048576) {
   $3_1 = $54($0_1, $1_1, $2_1, $4_1);
   $6_1 = Math_fround($6_1 + ($3_1 == $3_1 ? $3_1 : Math_fround(0.0)));
  }
  global$0 = $5_1 + 16 | 0;
  return $6_1;
 }
 
 function $16($0_1) {
  var $1_1 = 0, $2_1 = 0, $3_1 = 0;
  $2_1 = HEAP32[$0_1 >> 2];
  $1_1 = HEAP32[$2_1 + 488 >> 2];
  $3_1 = HEAP32[$0_1 + 4 >> 2] + 1 | 0;
  if ($3_1 >>> 0 >= HEAP32[$2_1 + 492 >> 2] - $1_1 >> 2 >>> 0) {
   while (1) {
    $1_1 = HEAP32[$0_1 + 8 >> 2];
    if (!$1_1) {
     HEAP32[$0_1 + 8 >> 2] = 0;
     HEAP32[$0_1 >> 2] = 0;
     HEAP32[$0_1 + 4 >> 2] = 0;
     return;
    }
    HEAP32[$0_1 >> 2] = HEAP32[$1_1 + 4 >> 2];
    HEAP32[$0_1 + 4 >> 2] = HEAP32[$1_1 + 8 >> 2];
    HEAP32[$0_1 + 8 >> 2] = HEAP32[$1_1 >> 2];
    $5($1_1);
    $2_1 = HEAP32[$0_1 >> 2];
    $1_1 = HEAP32[$2_1 + 488 >> 2];
    $3_1 = HEAP32[$0_1 + 4 >> 2] + 1 | 0;
    if ($3_1 >>> 0 >= HEAP32[$2_1 + 492 >> 2] - $1_1 >> 2 >>> 0) {
     continue
    }
    break;
   }
  }
  HEAP32[$0_1 + 4 >> 2] = $3_1;
  if ((HEAPU8[HEAP32[($3_1 << 2) + $1_1 >> 2] + 23 | 0] << 16 & 786432) == 524288) {
   $95($0_1)
  }
 }
 
 function $17($0_1, $1_1, $2_1) {
  var $3_1 = 0, $4_1 = Math_fround(0);
  $3_1 = global$0 - 16 | 0;
  global$0 = $3_1;
  $53($3_1 + 8 | 0, $0_1, ($1_1 & 254) != 2 ? 3 : (($2_1 | 0) != 2) << 1, $2_1);
  $4_1 = Math_fround(NaN);
  block2 : {
   block1 : {
    switch (HEAPU8[$3_1 + 12 | 0] - 1 | 0) {
    case 0:
     $4_1 = HEAPF32[$3_1 + 8 >> 2];
     break block2;
    case 1:
     break block1;
    default:
     break block2;
    };
   }
   $4_1 = Math_fround(Math_fround(HEAPF32[$3_1 + 8 >> 2] * Math_fround(0.0)) * Math_fround(.009999999776482582));
  }
  global$0 = $3_1 + 16 | 0;
  return $4_1 == $4_1 ? Math_fround(Math_max($4_1, Math_fround(0.0))) : Math_fround(0.0);
 }
 
 function $18($0_1, $1_1, $2_1) {
  var $3_1 = 0, $4_1 = Math_fround(0);
  $3_1 = global$0 - 16 | 0;
  global$0 = $3_1;
  $53($3_1 + 8 | 0, $0_1, ($1_1 & 254) != 2 ? 1 : (($2_1 | 0) == 2) << 1, $2_1);
  $4_1 = Math_fround(NaN);
  block2 : {
   block1 : {
    switch (HEAPU8[$3_1 + 12 | 0] - 1 | 0) {
    case 0:
     $4_1 = HEAPF32[$3_1 + 8 >> 2];
     break block2;
    case 1:
     break block1;
    default:
     break block2;
    };
   }
   $4_1 = Math_fround(Math_fround(HEAPF32[$3_1 + 8 >> 2] * Math_fround(0.0)) * Math_fround(.009999999776482582));
  }
  global$0 = $3_1 + 16 | 0;
  return $4_1 == $4_1 ? Math_fround(Math_max($4_1, Math_fround(0.0))) : Math_fround(0.0);
 }
 
 function $19($0_1, $1_1, $2_1, $3_1, $4_1) {
  var $5_1 = Math_fround(0), $6_1 = 0, $7_1 = Math_fround(0);
  $6_1 = ($2_1 << 3) + $0_1 | 0;
  $7_1 = HEAPF32[$6_1 + 504 >> 2];
  $5_1 = Math_fround(NaN);
  block2 : {
   block1 : {
    switch (HEAPU8[$6_1 + 508 | 0] - 1 | 0) {
    case 0:
     $5_1 = $7_1;
     break block2;
    case 1:
     break block1;
    default:
     break block2;
    };
   }
   $5_1 = Math_fround(Math_fround($7_1 * $3_1) * Math_fround(.009999999776482582));
  }
  if (HEAPU8[$0_1 + 23 | 0] << 16 & 1048576) {
   $3_1 = $54($0_1 + 20 | 0, $1_1, $2_1, $4_1);
   $5_1 = Math_fround($5_1 + ($3_1 == $3_1 ? $3_1 : Math_fround(0.0)));
  }
  return $5_1;
 }
 
 function $20($0_1, $1_1) {
  var $2_1 = 0;
  block : {
   $2_1 = HEAP32[$1_1 + 488 >> 2];
   if (($2_1 | 0) != HEAP32[$1_1 + 492 >> 2]) {
    HEAP32[$0_1 + 4 >> 2] = 0;
    HEAP32[$0_1 + 8 >> 2] = 0;
    HEAP32[$0_1 >> 2] = $1_1;
    if ((HEAPU8[HEAP32[$2_1 >> 2] + 23 | 0] << 16 & 786432) != 524288) {
     break block
    }
    $95($0_1);
    return;
   }
   HEAP32[$0_1 >> 2] = 0;
   HEAP32[$0_1 + 4 >> 2] = 0;
   HEAP32[$0_1 + 8 >> 2] = 0;
  }
 }
 
 function $21($0_1, $1_1, $2_1) {
  var $3_1 = 0, $4_1 = 0;
  block : {
   if (($0_1 | 0) == ($1_1 | 0)) {
    break block
   }
   $4_1 = $0_1 + $2_1 | 0;
   if ($1_1 - $4_1 >>> 0 <= 0 - ($2_1 << 1) >>> 0) {
    return $13($0_1, $1_1, $2_1)
   }
   $3_1 = ($0_1 ^ $1_1) & 3;
   block1 : {
    block2 : {
     if ($0_1 >>> 0 < $1_1 >>> 0) {
      if ($3_1) {
       $3_1 = $0_1;
       break block1;
      }
      if (!($0_1 & 3)) {
       $3_1 = $0_1;
       break block2;
      }
      $3_1 = $0_1;
      while (1) {
       if (!$2_1) {
        break block
       }
       HEAP8[$3_1 | 0] = HEAPU8[$1_1 | 0];
       $1_1 = $1_1 + 1 | 0;
       $2_1 = $2_1 - 1 | 0;
       $3_1 = $3_1 + 1 | 0;
       if ($3_1 & 3) {
        continue
       }
       break;
      };
      break block2;
     }
     block3 : {
      if ($3_1) {
       break block3
      }
      if ($4_1 & 3) {
       while (1) {
        if (!$2_1) {
         break block
        }
        $2_1 = $2_1 - 1 | 0;
        $3_1 = $2_1 + $0_1 | 0;
        HEAP8[$3_1 | 0] = HEAPU8[$1_1 + $2_1 | 0];
        if ($3_1 & 3) {
         continue
        }
        break;
       }
      }
      if ($2_1 >>> 0 <= 3) {
       break block3
      }
      while (1) {
       $2_1 = $2_1 - 4 | 0;
       HEAP32[$2_1 + $0_1 >> 2] = HEAP32[$1_1 + $2_1 >> 2];
       if ($2_1 >>> 0 > 3) {
        continue
       }
       break;
      };
     }
     if (!$2_1) {
      break block
     }
     while (1) {
      $2_1 = $2_1 - 1 | 0;
      HEAP8[$2_1 + $0_1 | 0] = HEAPU8[$1_1 + $2_1 | 0];
      if ($2_1) {
       continue
      }
      break;
     };
     break block;
    }
    if ($2_1 >>> 0 <= 3) {
     break block1
    }
    while (1) {
     HEAP32[$3_1 >> 2] = HEAP32[$1_1 >> 2];
     $1_1 = $1_1 + 4 | 0;
     $3_1 = $3_1 + 4 | 0;
     $2_1 = $2_1 - 4 | 0;
     if ($2_1 >>> 0 > 3) {
      continue
     }
     break;
    };
   }
   if (!$2_1) {
    break block
   }
   while (1) {
    HEAP8[$3_1 | 0] = HEAPU8[$1_1 | 0];
    $3_1 = $3_1 + 1 | 0;
    $1_1 = $1_1 + 1 | 0;
    $2_1 = $2_1 - 1 | 0;
    if ($2_1) {
     continue
    }
    break;
   };
  }
  return $0_1;
 }
 
 function $22($0_1, $1_1, $2_1, $3_1) {
  var $4_1 = 0.0, $5_1 = 0.0, $6_1 = 0;
  $0_1 = $0_1 * $1_1;
  $4_1 = $78($0_1);
  $4_1 = $4_1 < 0.0 ? $4_1 + 1.0 : $4_1;
  $6_1 = $4_1 != $4_1;
  block : {
   if (!($6_1 | !(Math_abs($4_1) < .0001))) {
    $0_1 = $0_1 - $4_1;
    break block;
   }
   if (!(!(Math_abs($4_1 + -1.0) < .0001) | $6_1)) {
    $0_1 = $0_1 - $4_1 + 1.0;
    break block;
   }
   $0_1 = $0_1 - $4_1;
   if ($2_1) {
    $0_1 = $0_1 + 1.0;
    break block;
   }
   if ($3_1) {
    break block
   }
   $5_1 = 0.0;
   block1 : {
    if ($6_1) {
     break block1
    }
    $5_1 = 1.0;
    if ($4_1 > .5) {
     break block1
    }
    $5_1 = Math_abs($4_1 + -.5) < .0001 ? 1.0 : 0.0;
   }
   $0_1 = $0_1 + $5_1;
  }
  if ($0_1 != $0_1 | $1_1 != $1_1) {
   return Math_fround(NaN)
  }
  return Math_fround($0_1 / $1_1);
 }
 
 function $23($0_1, $1_1, $2_1, $3_1, $4_1) {
  var $5_1 = 0, $6_1 = Math_fround(0);
  $5_1 = global$0 - 16 | 0;
  global$0 = $5_1;
  $1($5_1 + 8 | 0, $0_1 + 104 | 0, HEAPU16[(($2_1 << 1) + $0_1 | 0) + 94 >> 1]);
  $6_1 = Math_fround(NaN);
  block2 : {
   block1 : {
    switch (HEAPU8[$5_1 + 12 | 0] - 1 | 0) {
    case 0:
     $6_1 = HEAPF32[$5_1 + 8 >> 2];
     break block2;
    case 1:
     break block1;
    default:
     break block2;
    };
   }
   $6_1 = Math_fround(Math_fround(HEAPF32[$5_1 + 8 >> 2] * $3_1) * Math_fround(.009999999776482582));
  }
  if (HEAPU8[$0_1 + 3 | 0] << 16 & 1048576) {
   $3_1 = $54($0_1, $1_1, $2_1, $4_1);
   $6_1 = Math_fround($6_1 + ($3_1 == $3_1 ? $3_1 : Math_fround(0.0)));
  }
  global$0 = $5_1 + 16 | 0;
  return $6_1;
 }
 
 function $24($0_1, $1_1, $2_1, $3_1) {
  block : {
   switch ($2_1 | 0) {
   case 1:
    $37($0_1, $1_1, $1_1 + 30 | 0);
    return;
   case 2:
    $38($0_1, $1_1, $1_1 + 30 | 0, $3_1);
    return;
   case 3:
    $36($0_1, $1_1, $1_1 + 30 | 0);
    return;
   default:
    $6();
    wasm2js_trap();
   case 0:
    break block;
   };
  }
  $39($0_1, $1_1, $1_1 + 30 | 0, $3_1);
 }
 
 function $25($0_1, $1_1, $2_1, $3_1) {
  var $4_1 = 0, $5_1 = Math_fround(0);
  $4_1 = global$0 - 16 | 0;
  global$0 = $4_1;
  $50($4_1 + 8 | 0, $0_1, ($1_1 & 254) != 2 ? 3 : (($2_1 | 0) != 2) << 1, $2_1);
  $5_1 = Math_fround(NaN);
  block2 : {
   block1 : {
    switch (HEAPU8[$4_1 + 12 | 0] - 1 | 0) {
    case 0:
     $5_1 = HEAPF32[$4_1 + 8 >> 2];
     break block2;
    case 1:
     break block1;
    default:
     break block2;
    };
   }
   $5_1 = Math_fround(Math_fround(HEAPF32[$4_1 + 8 >> 2] * $3_1) * Math_fround(.009999999776482582));
  }
  global$0 = $4_1 + 16 | 0;
  return $5_1 == $5_1 ? Math_fround(Math_max($5_1, Math_fround(0.0))) : Math_fround(0.0);
 }
 
 function $26($0_1, $1_1, $2_1, $3_1) {
  var $4_1 = 0, $5_1 = Math_fround(0);
  $4_1 = global$0 - 16 | 0;
  global$0 = $4_1;
  $50($4_1 + 8 | 0, $0_1, ($1_1 & 254) != 2 ? 1 : (($2_1 | 0) == 2) << 1, $2_1);
  $5_1 = Math_fround(NaN);
  block2 : {
   block1 : {
    switch (HEAPU8[$4_1 + 12 | 0] - 1 | 0) {
    case 0:
     $5_1 = HEAPF32[$4_1 + 8 >> 2];
     break block2;
    case 1:
     break block1;
    default:
     break block2;
    };
   }
   $5_1 = Math_fround(Math_fround(HEAPF32[$4_1 + 8 >> 2] * $3_1) * Math_fround(.009999999776482582));
  }
  global$0 = $4_1 + 16 | 0;
  return $5_1 == $5_1 ? Math_fround(Math_max($5_1, Math_fround(0.0))) : Math_fround(0.0);
 }
 
 function $27($0_1, $1_1, $2_1, $3_1) {
  block1 : {
   block2 : {
    block : {
     $3_1 = $3_1 & 255;
     switch ($3_1 | 0) {
     case 0:
      break block;
     case 3:
      break block2;
     default:
      break block1;
     };
    }
    $0_1 = (HEAPU8[$1_1 | 0] | HEAPU8[$1_1 + 1 | 0] << 8) & 65528;
    HEAP8[$1_1 | 0] = $0_1;
    HEAP8[$1_1 + 1 | 0] = $0_1 >>> 8;
    return;
   }
   $0_1 = (HEAPU8[$1_1 | 0] | HEAPU8[$1_1 + 1 | 0] << 8) & 65528 | 4;
   HEAP8[$1_1 | 0] = $0_1;
   HEAP8[$1_1 + 1 | 0] = $0_1 >>> 8;
   return;
  }
  $46($0_1, $1_1, $2_1, ($3_1 | 0) == 1 ? 1 : 2);
 }
 
 function $28($0_1, $1_1, $2_1) {
  $0_1 = $0_1 | 0;
  $1_1 = $1_1 | 0;
  $2_1 = $2_1 | 0;
  var $3_1 = 0;
  $3_1 = HEAP32[$0_1 >> 2];
  $0_1 = HEAP32[$0_1 + 4 >> 2];
  $1_1 = ($0_1 >> 1) + $1_1 | 0;
  if ($0_1 & 1) {
   $3_1 = HEAP32[$3_1 + HEAP32[$1_1 >> 2] >> 2]
  }
  FUNCTION_TABLE[$3_1 | 0]($1_1, $2_1);
 }
 
 function $29($0_1) {
  var $1_1 = Math_fround(0), $2_1 = 0, $3_1 = 0, $4_1 = Math_fround(0);
  block : {
   if (!HEAP32[$0_1 + 484 >> 2]) {
    break block
   }
   $2_1 = $0_1 + 124 | 0;
   $3_1 = $0_1 + 26 | 0;
   $1_1 = $2($2_1, HEAPU16[$3_1 >> 1]);
   if ($1_1 != $1_1) {
    $3_1 = $0_1 + 24 | 0;
    $1_1 = $2($2_1, HEAPU16[$3_1 >> 1]);
    if ($1_1 != $1_1) {
     break block
    }
    if (!($2($2_1, HEAPU16[$0_1 + 24 >> 1]) > Math_fround(0.0))) {
     break block
    }
   }
   $4_1 = $2($2_1, HEAPU16[$3_1 >> 1]);
  }
  return $4_1;
 }
 
 function $30($0_1, $1_1) {
  var $2_1 = 0, $3_1 = 0, $4_1 = 0, $5_1 = 0;
  if ($1_1) {
   $4_1 = $0(12);
   $3_1 = $4_1;
   $2_1 = HEAP32[$1_1 + 8 >> 2];
   HEAP32[$3_1 + 4 >> 2] = HEAP32[$1_1 + 4 >> 2];
   HEAP32[$3_1 + 8 >> 2] = $2_1;
   $2_1 = $3_1;
   $1_1 = HEAP32[$1_1 >> 2];
   if ($1_1) {
    while (1) {
     $2_1 = $0(12);
     $5_1 = HEAP32[$1_1 + 8 >> 2];
     HEAP32[$2_1 + 4 >> 2] = HEAP32[$1_1 + 4 >> 2];
     HEAP32[$2_1 + 8 >> 2] = $5_1;
     HEAP32[$3_1 >> 2] = $2_1;
     $3_1 = $2_1;
     $1_1 = HEAP32[$1_1 >> 2];
     if ($1_1) {
      continue
     }
     break;
    }
   }
   HEAP32[$2_1 >> 2] = HEAP32[$0_1 >> 2];
   HEAP32[$0_1 >> 2] = $4_1;
  }
 }
 
 function $31($0_1, $1_1, $2_1, $3_1, $4_1, $5_1, $6_1, $7_1, $8_1, $9, $10_1, $11_1, $12_1) {
  var $13_1 = 0, $14_1 = 0, $15_1 = Math_fround(0), $16_1 = 0, $17_1 = 0, $18_1 = Math_fround(0), $19_1 = Math_fround(0), $20_1 = Math_fround(0), $21_1 = Math_fround(0), $22_1 = Math_fround(0), $23_1 = 0, $24_1 = Math_fround(0), $25_1 = 0, $26_1 = 0, $27_1 = 0, $28_1 = Math_fround(0), $29_1 = 0, $30_1 = 0, $31_1 = 0, $32_1 = 0, $33_1 = Math_fround(0), $34_1 = Math_fround(0), $35_1 = Math_fround(0), $36_1 = 0, $37_1 = 0, $38_1 = 0, $39_1 = 0, $40_1 = Math_fround(0), $41_1 = 0, $42_1 = 0, $43_1 = Math_fround(0), $44_1 = Math_fround(0), $45_1 = 0, $46_1 = Math_fround(0), $47_1 = 0, $48_1 = 0, $49_1 = 0, $50_1 = 0, $51_1 = Math_fround(0), $52_1 = 0, $53_1 = 0, $54_1 = Math_fround(0), $55_1 = 0, $56_1 = Math_fround(0), $57_1 = 0, $58_1 = Math_fround(0), $59_1 = 0, $60_1 = Math_fround(0), $61_1 = 0, $62_1 = 0, $63_1 = 0, $64_1 = 0, $65_1 = 0, $66_1 = Math_fround(0), $67_1 = 0, $68_1 = Math_fround(0), $69_1 = 0, $70_1 = 0, $71_1 = 0, $72_1 = Math_fround(0), $73_1 = 0, $74_1 = Math_fround(0), $75_1 = 0, $76_1 = 0, $77_1 = Math_fround(0), $78_1 = Math_fround(0), $79_1 = Math_fround(0), $80_1 = 0, $81_1 = 0, $82_1 = 0, $83_1 = 0, $84_1 = 0, $85_1 = 0, wasm2js_i32$0 = 0, wasm2js_f32$0 = Math_fround(0);
  block1 : {
   if (!(HEAP32[$0_1 + 164 >> 2] != HEAP32[HEAP32[$0_1 + 500 >> 2] + 12 >> 2] | (HEAP32[$0_1 + 160 >> 2] != ($12_1 | 0) ? HEAPU8[$0_1 | 0] & 4 : 0))) {
    $14_1 = 0;
    if (HEAPU8[$0_1 + 168 | 0] == ($3_1 | 0)) {
     break block1
    }
   }
   HEAP32[$0_1 + 384 >> 2] = -1082130432;
   HEAP32[$0_1 + 388 >> 2] = -1082130432;
   HEAP32[$0_1 + 376 >> 2] = 1;
   HEAP32[$0_1 + 380 >> 2] = 1;
   HEAP32[$0_1 + 368 >> 2] = -1082130432;
   HEAP32[$0_1 + 372 >> 2] = -1082130432;
   HEAP32[$0_1 + 172 >> 2] = 0;
   $14_1 = 1;
  }
  $75_1 = $14_1;
  block10 : {
   block3 : {
    block4 : {
     block2 : {
      if (HEAP32[$0_1 + 8 >> 2]) {
       $14_1 = $0_1 + 20 | 0;
       $18_1 = $4($14_1, 2, 1, $6_1);
       $21_1 = $3($14_1, 2, 1, $6_1);
       $15_1 = Math_fround($4($14_1, 0, 1, $6_1) + $3($14_1, 0, 1, $6_1));
       $14_1 = $0_1 + 368 | 0;
       $21_1 = Math_fround($18_1 + $21_1);
       $23_1 = HEAP32[$0_1 + 500 >> 2];
       if ($93($4_1, $1_1, $5_1, $2_1, HEAP32[$0_1 + 376 >> 2], HEAPF32[$14_1 >> 2], HEAP32[$0_1 + 380 >> 2], HEAPF32[$0_1 + 372 >> 2], HEAPF32[$0_1 + 384 >> 2], HEAPF32[$0_1 + 388 >> 2], $21_1, $15_1, $23_1)) {
        break block2
       }
       $32_1 = HEAP32[$0_1 + 172 >> 2];
       if (!$32_1) {
        break block3
       }
       $17_1 = $0_1 + 176 | 0;
       while (1) {
        $14_1 = $17_1 + Math_imul($48_1, 24) | 0;
        if ($93($4_1, $1_1, $5_1, $2_1, HEAP32[$14_1 + 8 >> 2], HEAPF32[$14_1 >> 2], HEAP32[$14_1 + 12 >> 2], HEAPF32[$14_1 + 4 >> 2], HEAPF32[$14_1 + 16 >> 2], HEAPF32[$14_1 + 20 >> 2], $21_1, $15_1, $23_1)) {
         break block2
        }
        $48_1 = $48_1 + 1 | 0;
        if (($32_1 | 0) != ($48_1 | 0)) {
         continue
        }
        break;
       };
       break block4;
      }
      if (!$8_1) {
       $32_1 = HEAP32[$0_1 + 172 >> 2];
       if (!$32_1) {
        break block4
       }
       $23_1 = $0_1 + 176 | 0;
       while (1) {
        $17_1 = Math_imul($48_1, 24);
        $14_1 = $17_1 + $23_1 | 0;
        $21_1 = HEAPF32[$14_1 >> 2];
        block6 : {
         block5 : {
          if (!($21_1 != $21_1 | $1_1 != $1_1)) {
           if (Math_fround(Math_abs(Math_fround($21_1 - $1_1))) < Math_fround(9.999999747378752e-05)) {
            break block5
           }
           break block6;
          }
          if ($1_1 == $1_1 | $21_1 == $21_1) {
           break block6
          }
         }
         $17_1 = $17_1 + $23_1 | 0;
         $21_1 = HEAPF32[$17_1 + 4 >> 2];
         block7 : {
          if (!($21_1 != $21_1 | $2_1 != $2_1)) {
           if (Math_fround(Math_abs(Math_fround($21_1 - $2_1))) < Math_fround(9.999999747378752e-05)) {
            break block7
           }
           break block6;
          }
          if ($2_1 == $2_1 | $21_1 == $21_1) {
           break block6
          }
         }
         if (HEAP32[$17_1 + 8 >> 2] != ($4_1 | 0)) {
          break block6
         }
         if (HEAP32[$17_1 + 12 >> 2] == ($5_1 | 0)) {
          break block2
         }
        }
        $48_1 = $48_1 + 1 | 0;
        if (($32_1 | 0) != ($48_1 | 0)) {
         continue
        }
        break;
       };
       break block4;
      }
      $14_1 = $0_1 + 368 | 0;
      $21_1 = HEAPF32[$14_1 >> 2];
      block8 : {
       if (!($21_1 != $21_1 | $1_1 != $1_1)) {
        if (Math_fround(Math_abs(Math_fround($21_1 - $1_1))) < Math_fround(9.999999747378752e-05)) {
         break block8
        }
        break block3;
       }
       if ($1_1 == $1_1 | $21_1 == $21_1) {
        break block3
       }
      }
      $32_1 = HEAP32[$0_1 + 376 >> 2] == ($4_1 | 0) ? (HEAP32[$0_1 + 380 >> 2] == ($5_1 | 0) ? $14_1 : 0) : 0;
      $14_1 = $2_1 != $2_1;
      $21_1 = HEAPF32[$0_1 + 372 >> 2];
      block9 : {
       if (!($14_1 | $21_1 != $21_1)) {
        $17_1 = Math_fround(Math_abs(Math_fround($21_1 - $2_1))) < Math_fround(9.999999747378752e-05);
        break block9;
       }
       $17_1 = 0;
       if ($21_1 == $21_1) {
        break block9
       }
       $17_1 = $14_1;
      }
      $14_1 = $17_1 ? $32_1 : 0;
     }
     if (!$14_1 | $75_1) {
      $48_1 = $14_1;
      break block3;
     }
     HEAPF32[$0_1 + 404 >> 2] = HEAPF32[$14_1 + 16 >> 2];
     HEAPF32[$0_1 + 408 >> 2] = HEAPF32[$14_1 + 20 >> 2];
     $3_1 = ($8_1 ? 12 : 16) + $10_1 | 0;
     HEAP32[$3_1 >> 2] = HEAP32[$3_1 >> 2] + 1;
     $48_1 = $14_1;
     break block10;
    }
    $48_1 = 0;
   }
   $24_1 = $6_1;
   $51_1 = $7_1;
   $65_1 = $11_1 + 1 | 0;
   $13_1 = global$0 - 160 | 0;
   global$0 = $13_1;
   block195 : {
    block11 : {
     if (!(($4_1 | 0) == 1 | $1_1 == $1_1)) {
      HEAP32[$13_1 + 32 >> 2] = 1450;
      $14($0_1, 5, 4824, $13_1 + 32 | 0);
      break block11;
     }
     if (!(($5_1 | 0) == 1 | $2_1 == $2_1)) {
      HEAP32[$13_1 + 16 >> 2] = 1369;
      $14($0_1, 5, 4824, $13_1 + 16 | 0);
      break block11;
     }
     $11_1 = ($8_1 ? 0 : 4) + $10_1 | 0;
     HEAP32[$11_1 >> 2] = HEAP32[$11_1 >> 2] + 1;
     $11_1 = HEAPU8[$0_1 + 20 | 0] & 3;
     $76_1 = $3_1 ? $3_1 : 1;
     $16_1 = $11_1 ? $11_1 : $76_1;
     HEAP8[$0_1 + 392 | 0] = HEAPU8[$0_1 + 392 | 0] & 252 | $16_1 & 3;
     $11_1 = $0_1 + 428 | 0;
     $17_1 = (($16_1 | 0) != 1) << 3;
     $30_1 = $0_1 + 20 | 0;
     $32_1 = ($16_1 | 0) == 2 ? 3 : 2;
     $15_1 = $4($30_1, $32_1, $16_1, $24_1);
     HEAPF32[$11_1 + $17_1 >> 2] = $15_1;
     $14_1 = (($16_1 | 0) == 1) << 3;
     $18_1 = $3($30_1, $32_1, $16_1, $24_1);
     HEAPF32[$11_1 + $14_1 >> 2] = $18_1;
     $21_1 = $4($30_1, 0, $16_1, $24_1);
     HEAPF32[$0_1 + 432 >> 2] = $21_1;
     $6_1 = $3($30_1, 0, $16_1, $24_1);
     HEAPF32[$0_1 + 440 >> 2] = $6_1;
     $11_1 = $0_1 + 444 | 0;
     (wasm2js_i32$0 = $11_1 + $17_1 | 0, wasm2js_f32$0 = $18($30_1, $32_1, $16_1)), HEAPF32[wasm2js_i32$0 >> 2] = wasm2js_f32$0;
     (wasm2js_i32$0 = $11_1 + $14_1 | 0, wasm2js_f32$0 = $17($30_1, $32_1, $16_1)), HEAPF32[wasm2js_i32$0 >> 2] = wasm2js_f32$0;
     (wasm2js_i32$0 = $0_1, wasm2js_f32$0 = $18($30_1, 0, $16_1)), HEAPF32[wasm2js_i32$0 + 448 >> 2] = wasm2js_f32$0;
     (wasm2js_i32$0 = $0_1, wasm2js_f32$0 = $17($30_1, 0, $16_1)), HEAPF32[wasm2js_i32$0 + 456 >> 2] = wasm2js_f32$0;
     $11_1 = $0_1 + 460 | 0;
     (wasm2js_i32$0 = $17_1 + $11_1 | 0, wasm2js_f32$0 = $26($30_1, $32_1, $16_1, $24_1)), HEAPF32[wasm2js_i32$0 >> 2] = wasm2js_f32$0;
     (wasm2js_i32$0 = $11_1 + $14_1 | 0, wasm2js_f32$0 = $25($30_1, $32_1, $16_1, $24_1)), HEAPF32[wasm2js_i32$0 >> 2] = wasm2js_f32$0;
     (wasm2js_i32$0 = $0_1, wasm2js_f32$0 = $26($30_1, 0, $16_1, $24_1)), HEAPF32[wasm2js_i32$0 + 464 >> 2] = wasm2js_f32$0;
     $7_1 = $25($30_1, 0, $16_1, $24_1);
     HEAPF32[$0_1 + 472 >> 2] = $7_1;
     $34_1 = Math_fround($15_1 + $18_1);
     $28_1 = Math_fround($21_1 + $6_1);
     block194 : {
      block13 : {
       $11_1 = HEAP32[$0_1 + 8 >> 2];
       if ($11_1) {
        $35_1 = ($4_1 | 0) == 1 ? Math_fround(NaN) : Math_fround($1_1 - $34_1);
        $15_1 = ($5_1 | 0) == 1 ? Math_fround(NaN) : Math_fround($2_1 - $28_1);
        block12 : {
         if (!($4_1 | $5_1)) {
          (wasm2js_i32$0 = $0_1, wasm2js_f32$0 = $7($0_1, 2, $16_1, $35_1, $24_1, $24_1)), HEAPF32[wasm2js_i32$0 + 404 >> 2] = wasm2js_f32$0;
          $6_1 = $7($0_1, 0, $16_1, $15_1, $51_1, $24_1);
          break block12;
         }
         if ($4_1 >>> 0 >= 3 | $5_1 >>> 0 >= 3) {
          break block11
         }
         $18_1 = Math_fround(Math_fround(Math_fround(HEAPF32[$0_1 + 460 >> 2] + HEAPF32[$0_1 + 468 >> 2]) + HEAPF32[$0_1 + 444 >> 2]) + HEAPF32[$0_1 + 452 >> 2]);
         $6_1 = Math_fround($35_1 - $18_1);
         $22_1 = $35_1 != $35_1 ? $35_1 : $6_1 > Math_fround(0.0) ? $6_1 : Math_fround(0.0);
         $21_1 = Math_fround(Math_fround(Math_fround(HEAPF32[$0_1 + 464 >> 2] + $7_1) + HEAPF32[$0_1 + 448 >> 2]) + HEAPF32[$0_1 + 456 >> 2]);
         $6_1 = Math_fround($15_1 - $21_1);
         FUNCTION_TABLE[$11_1 | 0]($13_1 + 136 | 0, $0_1, $22_1, 131073 >>> ($4_1 << 3 & 16777208) & 255, $15_1 != $15_1 ? $15_1 : $6_1 > Math_fround(0.0) ? $6_1 : Math_fround(0.0), 131073 >>> ($5_1 << 3 & 16777208) & 255);
         $19_1 = HEAPF32[$13_1 + 140 >> 2];
         $7_1 = HEAPF32[$13_1 + 136 >> 2];
         if (!($19_1 >= Math_fround(0.0) & $7_1 >= Math_fround(0.0))) {
          HEAPF64[$13_1 + 8 >> 3] = $19_1;
          HEAPF64[$13_1 >> 3] = $7_1;
          $14($0_1, 1, 3804, $13_1);
          $6_1 = HEAPF32[$13_1 + 140 >> 2];
          $19_1 = $6_1 > Math_fround(0.0) ? $6_1 : Math_fround(0.0);
          $6_1 = HEAPF32[$13_1 + 136 >> 2];
          $7_1 = $6_1 > Math_fround(0.0) ? $6_1 : Math_fround(0.0);
         }
         HEAP32[$10_1 + 20 >> 2] = HEAP32[$10_1 + 20 >> 2] + 1;
         $9 = ($9 << 2) + $10_1 | 0;
         HEAP32[$9 + 24 >> 2] = HEAP32[$9 + 24 >> 2] + 1;
         (wasm2js_i32$0 = $0_1, wasm2js_f32$0 = $7($0_1, 2, $16_1, $4_1 - 1 >>> 0 < 2 ? Math_fround($18_1 + $7_1) : $35_1, $24_1, $24_1)), HEAPF32[wasm2js_i32$0 + 404 >> 2] = wasm2js_f32$0;
         $6_1 = $7($0_1, 0, $16_1, $5_1 - 1 >>> 0 < 2 ? Math_fround($21_1 + $19_1) : $15_1, $51_1, $24_1);
        }
        HEAPF32[$0_1 + 408 >> 2] = $6_1;
        break block13;
       }
       block14 : {
        if (!HEAP32[$0_1 + 480 >> 2]) {
         $11_1 = HEAP32[$0_1 + 492 >> 2] - HEAP32[$0_1 + 488 >> 2] >> 2;
         break block14;
        }
        $20($13_1 + 136 | 0, $0_1);
        block15 : {
         if (!HEAP32[$13_1 + 136 >> 2]) {
          $11_1 = 0;
          if (!HEAP32[$13_1 + 140 >> 2]) {
           break block15
          }
         }
         $17_1 = $13_1 + 128 | 0;
         $11_1 = 0;
         while (1) {
          HEAP32[$13_1 + 128 >> 2] = 0;
          $9 = HEAP32[$13_1 + 140 >> 2];
          HEAP32[$13_1 + 120 >> 2] = HEAP32[$13_1 + 136 >> 2];
          HEAP32[$13_1 + 124 >> 2] = $9;
          $30($17_1, HEAP32[$13_1 + 144 >> 2]);
          $16($13_1 + 136 | 0);
          $9 = HEAP32[$13_1 + 128 >> 2];
          if ($9) {
           while (1) {
            $14_1 = HEAP32[$9 >> 2];
            $5($9);
            $9 = $14_1;
            if ($9) {
             continue
            }
            break;
           }
          }
          $11_1 = $11_1 + 1 | 0;
          HEAP32[$13_1 + 128 >> 2] = 0;
          if (HEAP32[$13_1 + 140 >> 2] | HEAP32[$13_1 + 136 >> 2]) {
           continue
          }
          break;
         };
        }
        $9 = HEAP32[$13_1 + 144 >> 2];
        if (!$9) {
         break block14
        }
        while (1) {
         $14_1 = HEAP32[$9 >> 2];
         $5($9);
         $9 = $14_1;
         if ($9) {
          continue
         }
         break;
        };
       }
       if (!$11_1) {
        (wasm2js_i32$0 = $0_1, wasm2js_f32$0 = $7($0_1, 2, $16_1, $4_1 - 1 >>> 0 > 1 ? Math_fround($1_1 - $34_1) : Math_fround(Math_fround(Math_fround(HEAPF32[$0_1 + 460 >> 2] + HEAPF32[$0_1 + 468 >> 2]) + HEAPF32[$0_1 + 444 >> 2]) + HEAPF32[$0_1 + 452 >> 2]), $24_1, $24_1)), HEAPF32[wasm2js_i32$0 + 404 >> 2] = wasm2js_f32$0;
        (wasm2js_i32$0 = $0_1, wasm2js_f32$0 = $7($0_1, 0, $16_1, $5_1 - 1 >>> 0 > 1 ? Math_fround($2_1 - $28_1) : Math_fround(Math_fround(Math_fround(HEAPF32[$0_1 + 464 >> 2] + HEAPF32[$0_1 + 472 >> 2]) + HEAPF32[$0_1 + 448 >> 2]) + HEAPF32[$0_1 + 456 >> 2]), $51_1, $24_1)), HEAPF32[wasm2js_i32$0 + 408 >> 2] = wasm2js_f32$0;
        break block13;
       }
       block16 : {
        if ($8_1) {
         break block16
        }
        $14_1 = ($5_1 | 0) == 2;
        $7_1 = Math_fround($2_1 - $28_1);
        $9 = ($4_1 | 0) == 2;
        $6_1 = Math_fround($1_1 - $34_1);
        if (!($14_1 & $7_1 == $7_1 & $7_1 <= Math_fround(0.0) | (!($4_1 | $5_1) | $9 & $6_1 <= Math_fround(0.0)))) {
         break block16
        }
        (wasm2js_i32$0 = $0_1, wasm2js_f32$0 = $7($0_1, 2, $16_1, $6_1 != $6_1 ? Math_fround(0.0) : $9 ? ($6_1 < Math_fround(0.0) ? Math_fround(0.0) : $6_1) : $6_1, $24_1, $24_1)), HEAPF32[wasm2js_i32$0 + 404 >> 2] = wasm2js_f32$0;
        (wasm2js_i32$0 = $0_1, wasm2js_f32$0 = $7($0_1, 0, $16_1, $7_1 != $7_1 ? Math_fround(0.0) : $14_1 ? ($7_1 < Math_fround(0.0) ? Math_fround(0.0) : $7_1) : $7_1, $51_1, $24_1)), HEAPF32[wasm2js_i32$0 + 408 >> 2] = wasm2js_f32$0;
        break block13;
       }
       $49($0_1);
       HEAP8[$0_1 + 392 | 0] = HEAPU8[$0_1 + 392 | 0] & 251;
       $64($0_1);
       $27_1 = 3;
       $9 = HEAPU8[$0_1 + 20 | 0] >>> 2 & 3;
       block18 : {
        block17 : {
         if (($16_1 | 0) != 2) {
          break block17
         }
         block19 : {
          switch ($9 - 2 | 0) {
          case 0:
           break block18;
          case 1:
           break block19;
          default:
           break block17;
          };
         }
         $27_1 = 2;
         break block18;
        }
        $27_1 = $9;
       }
       $29_1 = HEAPU8[$0_1 + 21 | 0] | HEAPU8[$0_1 + 22 | 0] << 8;
       $20_1 = $26($30_1, $27_1, $16_1, $24_1);
       $22_1 = $18($30_1, $27_1, $16_1);
       $19_1 = $25($30_1, $27_1, $16_1, $24_1);
       $40_1 = $17($30_1, $27_1, $16_1);
       $17_1 = 0;
       $31_1 = $27_1 >>> 0 < 2 ? $32_1 : 0;
       $18_1 = $26($30_1, $31_1, $16_1, $24_1);
       $21_1 = $18($30_1, $31_1, $16_1);
       $7_1 = $25($30_1, $31_1, $16_1, $24_1);
       $6_1 = $17($30_1, $31_1, $16_1);
       $35_1 = $66($30_1, $31_1, $16_1, $24_1);
       $15_1 = $45($30_1, $31_1, $16_1);
       $77_1 = Math_fround($1_1 - $34_1);
       $54_1 = Math_fround(Math_fround($20_1 + $22_1) + Math_fround($19_1 + $40_1));
       $44_1 = Math_fround(Math_fround($18_1 + $21_1) + Math_fround($7_1 + $6_1));
       $52_1 = $27_1 >>> 0 > 1;
       $20_1 = $92($0_1, $16_1, 0, $77_1, $52_1 ? $54_1 : $44_1, $24_1, $24_1);
       $78_1 = Math_fround($2_1 - $28_1);
       $40_1 = $92($0_1, $16_1, 1, $78_1, $52_1 ? $44_1 : $54_1, $51_1, $24_1);
       block22 : {
        $49_1 = $52_1 ? $4_1 : $5_1;
        block20 : {
         if ($49_1) {
          break block20
         }
         $20($13_1 + 136 | 0, $0_1);
         block24 : {
          block21 : {
           $9 = HEAP32[$13_1 + 140 >> 2];
           $14_1 = HEAP32[$13_1 + 136 >> 2];
           if (!($9 | $14_1)) {
            break block21
           }
           while (1) {
            $32_1 = HEAP32[$14_1 + 492 >> 2];
            $14_1 = HEAP32[$14_1 + 488 >> 2];
            if ($32_1 - $14_1 >> 2 >>> 0 <= $9 >>> 0) {
             break block22
            }
            $9 = HEAP32[$14_1 + ($9 << 2) >> 2];
            block23 : {
             if (!$91($9)) {
              break block23
             }
             if ($17_1) {
              break block21
             }
             $6_1 = $29($9);
             if ($6_1 == $6_1 & Math_fround(Math_abs($6_1)) < Math_fround(9.999999747378752e-05)) {
              break block21
             }
             $6_1 = $34($9);
             if ($6_1 != $6_1) {
              $17_1 = $9;
              break block23;
             }
             $17_1 = $9;
             if (Math_fround(Math_abs($6_1)) < Math_fround(9.999999747378752e-05)) {
              break block21
             }
            }
            $16($13_1 + 136 | 0);
            $9 = HEAP32[$13_1 + 140 >> 2];
            $14_1 = HEAP32[$13_1 + 136 >> 2];
            if ($9 | $14_1) {
             continue
            }
            break;
           };
           break block24;
          }
          $17_1 = 0;
         }
         $9 = HEAP32[$13_1 + 144 >> 2];
         if (!$9) {
          break block20
         }
         while (1) {
          $14_1 = HEAP32[$9 >> 2];
          $5($9);
          $9 = $14_1;
          if ($9) {
           continue
          }
          break;
         };
        }
        $20($13_1 + 136 | 0, $0_1);
        $9 = HEAP32[$13_1 + 140 >> 2];
        $14_1 = HEAP32[$13_1 + 136 >> 2];
        block25 : {
         if (!$14_1) {
          $19_1 = Math_fround(0.0);
          if (!$9) {
           break block25
          }
         }
         $62_1 = $40_1 != $40_1;
         $39_1 = $62_1 | ($5_1 | 0) != 0;
         $38_1 = $20_1 != $20_1;
         $32_1 = $38_1 | ($4_1 | 0) != 0;
         $19_1 = Math_fround(0.0);
         while (1) {
          $23_1 = HEAP32[$14_1 + 492 >> 2];
          $14_1 = HEAP32[$14_1 + 488 >> 2];
          if ($23_1 - $14_1 >> 2 >>> 0 <= $9 >>> 0) {
           break block22
          }
          $26_1 = HEAP32[$14_1 + ($9 << 2) >> 2];
          $90($26_1);
          $9 = HEAPU8[$26_1 + 21 | 0] | HEAPU8[$26_1 + 22 | 0] << 8 | HEAPU8[$26_1 + 23 | 0] << 16;
          block26 : {
           if (($9 & 786432) == 262144) {
            $89($26_1);
            $14_1 = HEAPU8[$26_1 | 0];
            $9 = $14_1 | 1;
            HEAP8[$26_1 | 0] = $14_1 & 4 ? $9 & 251 : $9;
            break block26;
           }
           if ($8_1) {
            $9 = HEAPU8[$26_1 + 20 | 0] & 3;
            $88($26_1, $9 ? $9 : $16_1, $20_1, $40_1);
            $9 = HEAPU8[$26_1 + 21 | 0] | HEAPU8[$26_1 + 22 | 0] << 8 | HEAPU8[$26_1 + 23 | 0] << 16;
           }
           if (($9 & 12288) == 8192) {
            break block26
           }
           $37_1 = $26_1 + 20 | 0;
           block27 : {
            if (($17_1 | 0) == ($26_1 | 0)) {
             HEAP32[$17_1 + 156 >> 2] = 0;
             HEAP32[$17_1 + 152 >> 2] = $12_1;
             $7_1 = Math_fround(0.0);
             break block27;
            }
            $9 = HEAPU8[$30_1 | 0] >>> 2 & 3;
            block29 : {
             block28 : {
              if (($16_1 | 0) != 2) {
               break block28
              }
              $23_1 = 3;
              block30 : {
               switch ($9 - 2 | 0) {
               case 0:
                break block29;
               case 1:
                break block30;
               default:
                break block28;
               };
              }
              $23_1 = 2;
              break block29;
             }
             $23_1 = $9;
            }
            HEAP32[$13_1 + 104 >> 2] = 2143289344;
            HEAP32[$13_1 + 80 >> 2] = 2143289344;
            $50_1 = $26_1 + 124 | 0;
            $1($13_1 + 120 | 0, $50_1, HEAPU16[$26_1 + 30 >> 1]);
            $55_1 = $23_1 >>> 0 > 1;
            $21_1 = $55_1 ? $20_1 : $40_1;
            block35 : {
             block34 : {
              block32 : {
               block31 : {
                $9 = HEAPU8[$13_1 + 124 | 0];
                switch ($9 | 0) {
                case 0:
                case 3:
                 break block31;
                default:
                 break block32;
                };
               }
               block33 : {
                $6_1 = $2($50_1, HEAPU16[$26_1 + 24 >> 1]);
                if ($6_1 != $6_1) {
                 break block33
                }
                if (!($2($50_1, HEAPU16[$26_1 + 24 >> 1]) > Math_fround(0.0))) {
                 break block33
                }
                $9 = HEAP8[HEAP32[$26_1 + 500 >> 2] + 8 | 0] & 1;
                if ($9) {
                 break block33
                }
                $7_1 = $9 ? Math_fround(NaN) : Math_fround(0.0);
                break block34;
               }
               $6_1 = Math_fround(NaN);
               break block35;
              }
              $7_1 = HEAPF32[$13_1 + 120 >> 2];
              $6_1 = Math_fround(NaN);
              block36 : {
               switch ($9 - 1 | 0) {
               case 0:
                break block34;
               case 1:
                break block36;
               default:
                break block35;
               };
              }
              $6_1 = Math_fround(Math_fround($7_1 * $21_1) * Math_fround(.009999999776482582));
              break block35;
             }
             $6_1 = $7_1;
            }
            if (HEAPU8[$26_1 + 23 | 0] << 16 & 1048576) {
             $7_1 = $6_1;
             $6_1 = $54($37_1, $16_1, 257 >>> ($23_1 << 3) & 1, $20_1);
             $6_1 = Math_fround($7_1 + ($6_1 == $6_1 ? $6_1 : Math_fround(0.0)));
            }
            $7_1 = HEAPF32[$26_1 + 504 >> 2];
            $59_1 = 0;
            $53_1 = 0;
            block39 : {
             block37 : {
              switch (HEAPU8[$26_1 + 508 | 0] - 1 | 0) {
              case 1:
               $7_1 = Math_fround(Math_fround($20_1 * $7_1) * Math_fround(.009999999776482582));
               break;
              case 0:
               break block37;
              default:
               break block39;
              };
             }
             if ($7_1 != $7_1) {
              break block39
             }
             $53_1 = $7_1 >= Math_fround(0.0);
            }
            $7_1 = HEAPF32[$26_1 + 512 >> 2];
            block42 : {
             block40 : {
              switch (HEAPU8[$26_1 + 516 | 0] - 1 | 0) {
              case 1:
               $7_1 = Math_fround(Math_fround($40_1 * $7_1) * Math_fround(.009999999776482582));
               break;
              case 0:
               break block40;
              default:
               break block42;
              };
             }
             if ($7_1 != $7_1) {
              break block42
             }
             $59_1 = $7_1 >= Math_fround(0.0);
            }
            $9 = $6_1 != $6_1;
            block43 : {
             block44 : {
              if (!($9 | $21_1 != $21_1)) {
               $7_1 = HEAPF32[$26_1 + 156 >> 2];
               if ($7_1 == $7_1) {
                if (!(HEAP8[HEAP32[$26_1 + 500 >> 2] + 16 | 0] & 1) | HEAP32[$26_1 + 152 >> 2] == ($12_1 | 0)) {
                 break block43
                }
               }
               $7_1 = Math_fround(Math_fround($26($37_1, $23_1, $16_1, $20_1) + $18($37_1, $23_1, $16_1)) + Math_fround($25($37_1, $23_1, $16_1, $20_1) + $17($37_1, $23_1, $16_1)));
               $7_1 = $6_1 == $6_1 & $7_1 == $7_1 ? ($6_1 < $7_1 ? $7_1 : $6_1) : $9 ? $7_1 : $6_1;
               break block44;
              }
              if ($53_1 & $55_1) {
               $6_1 = Math_fround(Math_fround($26($37_1, 2, $16_1, $20_1) + $18($37_1, 2, $16_1)) + Math_fround($25($37_1, 2, $16_1, $20_1) + $17($37_1, 2, $16_1)));
               $7_1 = $19($26_1, $16_1, 0, $20_1, $20_1);
               $7_1 = $7_1 == $7_1 & $6_1 == $6_1 ? ($6_1 > $7_1 ? $6_1 : $7_1) : $7_1 != $7_1 ? $6_1 : $7_1;
               break block44;
              }
              if (!($55_1 | !$59_1)) {
               $6_1 = Math_fround(Math_fround($26($37_1, 0, $16_1, $20_1) + $18($37_1, 0, $16_1)) + Math_fround($25($37_1, 0, $16_1, $20_1) + $17($37_1, 0, $16_1)));
               $7_1 = $19($26_1, $16_1, 1, $40_1, $20_1);
               $7_1 = $7_1 == $7_1 & $6_1 == $6_1 ? ($6_1 > $7_1 ? $6_1 : $7_1) : $7_1 != $7_1 ? $6_1 : $7_1;
               break block44;
              }
              $42_1 = 1;
              HEAP32[$13_1 + 100 >> 2] = 1;
              HEAP32[$13_1 + 120 >> 2] = 1;
              $22_1 = Math_fround($4($37_1, 2, 1, $20_1) + $3($37_1, 2, 1, $20_1));
              $18_1 = $4($37_1, 0, 1, $20_1);
              $21_1 = $3($37_1, 0, 1, $20_1);
              $7_1 = Math_fround(NaN);
              $45_1 = 1;
              $6_1 = Math_fround(NaN);
              if ($53_1) {
               $6_1 = $19($26_1, $16_1, 0, $20_1, $20_1);
               HEAP32[$13_1 + 120 >> 2] = 0;
               $6_1 = Math_fround($22_1 + $6_1);
               HEAPF32[$13_1 + 104 >> 2] = $6_1;
               $45_1 = 0;
              }
              $18_1 = Math_fround($18_1 + $21_1);
              if ($59_1) {
               $7_1 = $19($26_1, $16_1, 1, $40_1, $20_1);
               HEAP32[$13_1 + 100 >> 2] = 0;
               $7_1 = Math_fround($18_1 + $7_1);
               HEAPF32[$13_1 + 80 >> 2] = $7_1;
               $42_1 = 0;
              }
              $9 = (HEAPU8[$0_1 + 23 | 0] << 16 & 196608) == 131072;
              $14_1 = $23_1 >>> 0 < 2;
              block47 : {
               block45 : {
                block46 : {
                 if (!($9 & $14_1)) {
                  if ($9 | $38_1) {
                   break block45
                  }
                  if ($6_1 != $6_1) {
                   break block46
                  }
                  break block45;
                 }
                 if ($38_1 | $6_1 == $6_1) {
                  break block47
                 }
                }
                $45_1 = 2;
                HEAP32[$13_1 + 120 >> 2] = 2;
                HEAPF32[$13_1 + 104 >> 2] = $20_1;
                $6_1 = $20_1;
               }
               block48 : {
                if ($9 ? $14_1 : 1) {
                 if ($9 | $62_1) {
                  break block47
                 }
                 if ($7_1 != $7_1) {
                  break block48
                 }
                 break block47;
                }
                if ($62_1 | $7_1 == $7_1) {
                 break block47
                }
               }
               $42_1 = 2;
               HEAP32[$13_1 + 100 >> 2] = 2;
               HEAPF32[$13_1 + 80 >> 2] = $40_1;
               $7_1 = $40_1;
              }
              $21_1 = $2($50_1, HEAPU16[$26_1 + 122 >> 1]);
              block49 : {
               if ($21_1 != $21_1) {
                break block49
               }
               block50 : {
                if (!($45_1 | $55_1)) {
                 $7_1 = $2($50_1, HEAPU16[$26_1 + 122 >> 1]);
                 HEAP32[$13_1 + 100 >> 2] = 0;
                 HEAPF32[$13_1 + 80 >> 2] = $18_1 + Math_fround(Math_fround($6_1 - $22_1) / $7_1);
                 break block50;
                }
                if ($14_1 | $42_1) {
                 break block49
                }
                $6_1 = $2($50_1, HEAPU16[$26_1 + 122 >> 1]);
                HEAP32[$13_1 + 120 >> 2] = 0;
                HEAPF32[$13_1 + 104 >> 2] = Math_fround($6_1 * Math_fround($7_1 - $18_1)) + $22_1;
               }
               $42_1 = 0;
               $45_1 = 0;
              }
              $9 = (HEAPU8[$26_1 + 22 | 0] | HEAPU8[$26_1 + 23 | 0] << 8) & 15;
              if (!$9) {
               $9 = HEAPU8[$0_1 + 21 | 0] >>> 4 | 0
              }
              block51 : {
               if (!$45_1 | ($55_1 | ($9 | 0) == 5 | ($32_1 | $53_1 | ($9 | 0) != 4))) {
                break block51
               }
               HEAP32[$13_1 + 120 >> 2] = 0;
               HEAPF32[$13_1 + 104 >> 2] = $20_1;
               $6_1 = $2($50_1, HEAPU16[$26_1 + 122 >> 1]);
               if ($6_1 != $6_1) {
                break block51
               }
               $42_1 = 0;
               $6_1 = $2($50_1, HEAPU16[$26_1 + 122 >> 1]);
               HEAP32[$13_1 + 100 >> 2] = 0;
               HEAPF32[$13_1 + 80 >> 2] = Math_fround($20_1 - $22_1) / $6_1;
              }
              $53_1 = (HEAPU8[$26_1 + 22 | 0] | HEAPU8[$26_1 + 23 | 0] << 8) & 15;
              if (!$53_1) {
               $53_1 = HEAPU8[$0_1 + 21 | 0] >>> 4 | 0
              }
              block52 : {
               if ($14_1 | $39_1 | $59_1 | ($53_1 | 0) == 5 | (!$42_1 | ($53_1 | 0) != 4)) {
                break block52
               }
               HEAP32[$13_1 + 100 >> 2] = 0;
               HEAPF32[$13_1 + 80 >> 2] = $40_1;
               $6_1 = $2($50_1, HEAPU16[$26_1 + 122 >> 1]);
               if ($6_1 != $6_1) {
                break block52
               }
               $6_1 = $2($50_1, HEAPU16[$26_1 + 122 >> 1]);
               HEAP32[$13_1 + 120 >> 2] = 0;
               HEAPF32[$13_1 + 104 >> 2] = $6_1 * Math_fround($40_1 - $18_1);
              }
              $33($26_1, $16_1, 2, $20_1, $20_1, $13_1 + 120 | 0, $13_1 + 104 | 0);
              $33($26_1, $16_1, 0, $40_1, $20_1, $13_1 + 100 | 0, $13_1 + 80 | 0);
              $31($26_1, HEAPF32[$13_1 + 104 >> 2], HEAPF32[$13_1 + 80 >> 2], $16_1, HEAP32[$13_1 + 120 >> 2], HEAP32[$13_1 + 100 >> 2], $20_1, $40_1, 0, 5, $10_1, $65_1, $12_1);
              $7_1 = HEAPF32[($26_1 + (HEAP32[($23_1 << 2) + 4860 >> 2] << 2) | 0) + 404 >> 2];
              $6_1 = Math_fround(Math_fround($26($37_1, $23_1, $16_1, $20_1) + $18($37_1, $23_1, $16_1)) + Math_fround($25($37_1, $23_1, $16_1, $20_1) + $17($37_1, $23_1, $16_1)));
              $7_1 = $7_1 == $7_1 & $6_1 == $6_1 ? ($6_1 > $7_1 ? $6_1 : $7_1) : $7_1 != $7_1 ? $6_1 : $7_1;
             }
             HEAPF32[$26_1 + 156 >> 2] = $7_1;
            }
            HEAP32[$26_1 + 152 >> 2] = $12_1;
           }
           $19_1 = Math_fround($19_1 + Math_fround($7_1 + Math_fround($4($37_1, $27_1, 1, $20_1) + $3($37_1, $27_1, 1, $20_1))));
          }
          $16($13_1 + 136 | 0);
          $9 = HEAP32[$13_1 + 140 >> 2];
          $14_1 = HEAP32[$13_1 + 136 >> 2];
          if ($9 | $14_1) {
           continue
          }
          break;
         };
        }
        $9 = HEAP32[$13_1 + 144 >> 2];
        if ($9) {
         while (1) {
          $14_1 = HEAP32[$9 >> 2];
          $5($9);
          $9 = $14_1;
          if ($9) {
           continue
          }
          break;
         }
        }
        $7_1 = $52_1 ? $20_1 : $40_1;
        $6_1 = Math_fround($19_1 + Math_fround(0.0));
        if ($11_1 >>> 0 >= 2) {
         $6_1 = Math_fround(Math_fround($47($30_1, $27_1, $7_1) * Math_fround($11_1 - 1 >>> 0)) + $6_1)
        }
        $21_1 = Math_fround($35_1 + $15_1);
        $63_1 = $52_1 ? $5_1 : $4_1;
        $66_1 = $52_1 ? $51_1 : $24_1;
        $56_1 = $52_1 ? $24_1 : $51_1;
        $20($13_1 + 80 | 0, $0_1);
        $11_1 = $6_1 > $7_1;
        $69_1 = $29_1 & 49152;
        $67_1 = $69_1 ? (($49_1 | 0) == 2 ? ($11_1 ? 0 : $49_1) : $49_1) : $49_1;
        $35_1 = $52_1 ? $40_1 : $20_1;
        $79_1 = $47($30_1, $31_1, $35_1);
        $9 = HEAP32[$13_1 + 80 >> 2];
        $32_1 = HEAP32[$13_1 + 84 >> 2];
        if ($9 | $32_1) {
         $80_1 = $35_1 != $35_1;
         $84_1 = $80_1 ? 1 : 2;
         $85_1 = !$11_1 | ($49_1 | 0) == 1;
         $64_1 = $27_1 >>> 0 < 2;
         $26_1 = $0_1 + 114 | 0;
         $37_1 = $0_1 + 124 | 0;
         $14_1 = $27_1 << 2;
         $50_1 = $14_1 + 4844 | 0;
         $53_1 = $14_1 + 4828 | 0;
         $11_1 = $31_1 << 2;
         $70_1 = $11_1 + 4844 | 0;
         $71_1 = $11_1 + 4828 | 0;
         $81_1 = $14_1 + 4860 | 0;
         $73_1 = $11_1 + 4860 | 0;
         $52_1 = ($63_1 | 0) != 0;
         $42_1 = $52_1 | $8_1;
         $49_1 = !$63_1;
         $55_1 = $49_1 & ($8_1 ^ 1);
         $59_1 = !($63_1 | $69_1);
         $62_1 = $13_1 + 112 | 0;
         $82_1 = $13_1 + 128 | 0;
         $83_1 = 257 >>> ($27_1 << 3) & 255;
         $38_1 = $63_1 - 1 >>> 0 < 2;
         while (1) {
          HEAP32[$13_1 + 128 >> 2] = 0;
          HEAP32[$13_1 + 120 >> 2] = 0;
          HEAP32[$13_1 + 124 >> 2] = 0;
          $14_1 = HEAP32[$0_1 + 492 >> 2];
          $11_1 = HEAP32[$0_1 + 488 >> 2];
          block53 : {
           if (($14_1 | 0) == ($11_1 | 0)) {
            break block53
           }
           $11_1 = $14_1 - $11_1 | 0;
           if (($11_1 | 0) < 0) {
            break block22
           }
           $23_1 = $44($13_1 + 136 | 0, $11_1 >> 2, 0, $82_1);
           $14_1 = HEAP32[$13_1 + 120 >> 2];
           $11_1 = HEAP32[$13_1 + 124 >> 2] - $14_1 | 0;
           $11_1 = $21(HEAP32[$13_1 + 140 >> 2] - $11_1 | 0, $14_1, $11_1);
           $29_1 = HEAP32[$13_1 + 120 >> 2];
           HEAP32[$13_1 + 140 >> 2] = $29_1;
           HEAP32[$13_1 + 120 >> 2] = $11_1;
           $17_1 = HEAP32[$13_1 + 144 >> 2];
           $14_1 = HEAP32[$13_1 + 148 >> 2];
           $39_1 = HEAP32[$13_1 + 124 >> 2];
           HEAP32[$13_1 + 144 >> 2] = $39_1;
           $11_1 = HEAP32[$13_1 + 128 >> 2];
           HEAP32[$13_1 + 124 >> 2] = $17_1;
           HEAP32[$13_1 + 128 >> 2] = $14_1;
           HEAP32[$13_1 + 148 >> 2] = $11_1;
           HEAP32[$23_1 >> 2] = $29_1;
           if (($29_1 | 0) != ($39_1 | 0)) {
            HEAP32[$13_1 + 144 >> 2] = $39_1 + (($29_1 - $39_1 | 0) + 3 & -4)
           }
           if (!$29_1) {
            break block53
           }
           $5($29_1);
          }
          $14_1 = HEAPU8[$30_1 | 0];
          $11_1 = $14_1 >>> 2 & 3;
          block55 : {
           block54 : {
            $14_1 = $14_1 & 3;
            $47_1 = $14_1 ? $14_1 : $76_1;
            if (($47_1 | 0) != 2) {
             break block54
            }
            $17_1 = 3;
            block56 : {
             switch ($11_1 - 2 | 0) {
             case 0:
              break block55;
             case 1:
              break block56;
             default:
              break block54;
             };
            }
            $17_1 = 2;
            break block55;
           }
           $17_1 = $11_1;
          }
          $11_1 = HEAPU8[$0_1 + 21 | 0] | HEAPU8[$0_1 + 22 | 0] << 8;
          $34_1 = $47($30_1, $17_1, $7_1);
          block57 : {
           if (!($9 | $32_1)) {
            $46_1 = Math_fround(0.0);
            $32_1 = 0;
            $43_1 = Math_fround(0.0);
            $33_1 = Math_fround(0.0);
            $45_1 = 0;
            break block57;
           }
           $29_1 = $11_1 & 49152;
           $25_1 = $17_1 >>> 0 < 2;
           $11_1 = $17_1 << 2;
           $39_1 = $11_1 + 4844 | 0;
           $23_1 = $11_1 + 4828 | 0;
           $45_1 = 0;
           $33_1 = Math_fround(0.0);
           $14_1 = $32_1;
           $43_1 = Math_fround(0.0);
           $46_1 = Math_fround(0.0);
           $61_1 = 0;
           $19_1 = Math_fround(0.0);
           while (1) {
            $11_1 = HEAP32[$9 + 492 >> 2];
            $9 = HEAP32[$9 + 488 >> 2];
            if ($11_1 - $9 >> 2 >>> 0 <= $14_1 >>> 0) {
             break block22
            }
            $41_1 = HEAP32[$9 + ($14_1 << 2) >> 2];
            $9 = HEAPU8[$41_1 + 21 | 0] | HEAPU8[$41_1 + 22 | 0] << 8 | HEAPU8[$41_1 + 23 | 0] << 16;
            block58 : {
             if (($9 & 786432) == 262144 | ($9 & 12288) == 8192) {
              break block58
             }
             $9 = $13_1 + 136 | 0;
             $36_1 = $41_1 + 20 | 0;
             $10($9, $36_1, HEAP32[$23_1 >> 2], $3_1);
             $11_1 = HEAPU8[$13_1 + 140 | 0];
             $10($9, $36_1, HEAP32[$39_1 >> 2], $3_1);
             $9 = HEAPU8[$13_1 + 140 | 0];
             HEAP32[$41_1 + 476 >> 2] = $57_1;
             $32_1 = (($11_1 | 0) == 3) + $45_1 | 0;
             $11_1 = ($9 | 0) == 3;
             $28_1 = $4($36_1, $17_1, 1, $20_1);
             $22_1 = $3($36_1, $17_1, 1, $20_1);
             $61_1 = $61_1 ? $61_1 : $41_1;
             $9 = ($41_1 | 0) == ($61_1 | 0);
             $18_1 = HEAPF32[$41_1 + 156 >> 2];
             $15_1 = $23($36_1, $47_1, $25_1, $56_1, $24_1);
             $6_1 = $15($36_1, $47_1, $25_1, $56_1, $24_1);
             block59 : {
              if ($6_1 >= Math_fround(0.0) & $6_1 < $18_1) {
               break block59
              }
              if (!($15_1 >= Math_fround(0.0))) {
               $6_1 = $18_1;
               break block59;
              }
              $6_1 = $15_1 > $18_1 ? $15_1 : $18_1;
             }
             $45_1 = $11_1 + $32_1 | 0;
             $15_1 = $9 ? Math_fround(0.0) : $34_1;
             $18_1 = Math_fround($28_1 + $22_1);
             if (!(!$29_1 | !(Math_fround($15_1 + Math_fround($18_1 + Math_fround($19_1 + $6_1))) > $7_1) | HEAP32[$13_1 + 120 >> 2] == HEAP32[$13_1 + 124 >> 2])) {
              $32_1 = $14_1;
              break block57;
             }
             if ($91($41_1)) {
              $43_1 = Math_fround($43_1 + $29($41_1));
              $46_1 = Math_fround($46_1 - Math_fround($34($41_1) * HEAPF32[$41_1 + 156 >> 2]));
             }
             $6_1 = Math_fround($15_1 + Math_fround($18_1 + $6_1));
             $33_1 = Math_fround($33_1 + $6_1);
             $19_1 = Math_fround($19_1 + $6_1);
             $9 = HEAP32[$13_1 + 124 >> 2];
             if (($9 | 0) != HEAP32[$13_1 + 128 >> 2]) {
              HEAP32[$9 >> 2] = $41_1;
              HEAP32[$13_1 + 124 >> 2] = $9 + 4;
              break block58;
             }
             $32_1 = $9 - HEAP32[$13_1 + 120 >> 2] | 0;
             $11_1 = $32_1 >> 2;
             $14_1 = $11_1 + 1 | 0;
             if ($14_1 >>> 0 >= 1073741824) {
              break block22
             }
             $9 = $32_1 >> 1;
             $32_1 = $44($13_1 + 136 | 0, $32_1 >>> 0 >= 2147483644 ? 1073741823 : $9 >>> 0 > $14_1 >>> 0 ? $9 : $14_1, $11_1, $82_1);
             HEAP32[HEAP32[$13_1 + 144 >> 2] >> 2] = $41_1;
             HEAP32[$13_1 + 144 >> 2] = HEAP32[$13_1 + 144 >> 2] + 4;
             $11_1 = HEAP32[$13_1 + 120 >> 2];
             $9 = HEAP32[$13_1 + 124 >> 2] - $11_1 | 0;
             $9 = $21(HEAP32[$13_1 + 140 >> 2] - $9 | 0, $11_1, $9);
             $41_1 = HEAP32[$13_1 + 120 >> 2];
             HEAP32[$13_1 + 140 >> 2] = $41_1;
             HEAP32[$13_1 + 120 >> 2] = $9;
             $14_1 = HEAP32[$13_1 + 144 >> 2];
             $11_1 = HEAP32[$13_1 + 148 >> 2];
             $36_1 = HEAP32[$13_1 + 124 >> 2];
             HEAP32[$13_1 + 144 >> 2] = $36_1;
             $9 = HEAP32[$13_1 + 128 >> 2];
             HEAP32[$13_1 + 124 >> 2] = $14_1;
             HEAP32[$13_1 + 128 >> 2] = $11_1;
             HEAP32[$13_1 + 148 >> 2] = $9;
             HEAP32[$32_1 >> 2] = $41_1;
             if (($36_1 | 0) != ($41_1 | 0)) {
              HEAP32[$13_1 + 144 >> 2] = $36_1 + (($41_1 - $36_1 | 0) + 3 & -4)
             }
             if (!$41_1) {
              break block58
             }
             $5($41_1);
            }
            HEAP32[$13_1 + 112 >> 2] = 0;
            $9 = HEAP32[$13_1 + 84 >> 2];
            HEAP32[$13_1 + 104 >> 2] = HEAP32[$13_1 + 80 >> 2];
            HEAP32[$13_1 + 108 >> 2] = $9;
            $30($62_1, HEAP32[$13_1 + 88 >> 2]);
            $16($13_1 + 80 | 0);
            $9 = HEAP32[$13_1 + 112 >> 2];
            if ($9) {
             while (1) {
              $11_1 = HEAP32[$9 >> 2];
              $5($9);
              $9 = $11_1;
              if ($9) {
               continue
              }
              break;
             }
            }
            $32_1 = 0;
            HEAP32[$13_1 + 112 >> 2] = 0;
            $9 = HEAP32[$13_1 + 80 >> 2];
            $14_1 = HEAP32[$13_1 + 84 >> 2];
            if ($9 | $14_1) {
             continue
            }
            break;
           };
          }
          $18_1 = $43_1 > Math_fround(0.0) ? ($43_1 < Math_fround(1.0) ? Math_fround(1.0) : $43_1) : $43_1;
          $47_1 = HEAP32[$13_1 + 124 >> 2];
          $9 = HEAP32[$13_1 + 120 >> 2];
          block66 : {
           block65 : {
            block63 : {
             block64 : {
              block62 : {
               block61 : {
                if (!$67_1) {
                 break block61
                }
                $22_1 = $23($30_1, $16_1, 0, $24_1, $24_1);
                $19_1 = $15($30_1, $16_1, 0, $24_1, $24_1);
                $6_1 = $23($30_1, $16_1, 1, $51_1, $24_1);
                $15_1 = $15($30_1, $16_1, 1, $51_1, $24_1);
                $11_1 = $27_1 >>> 0 > 1;
                $6_1 = Math_fround(($11_1 ? $22_1 : $6_1) - $54_1);
                if ($6_1 == $6_1 & $6_1 > $33_1) {
                 break block62
                }
                $6_1 = Math_fround(($11_1 ? $19_1 : $15_1) - $54_1);
                if ($6_1 == $6_1 & $6_1 < $33_1) {
                 break block62
                }
                if (HEAP8[HEAP32[$0_1 + 500 >> 2] + 20 | 0] & 1) {
                 break block61
                }
                $6_1 = $33_1;
                if ($18_1 == Math_fround(0.0)) {
                 break block63
                }
                $6_1 = $29($0_1);
                if ($6_1 != $6_1) {
                 break block64
                }
                $6_1 = $33_1;
                if ($29($0_1) == Math_fround(0.0)) {
                 break block63
                }
                break block64;
               }
               $6_1 = $7_1;
              }
              if ($6_1 == $6_1) {
               break block65
              }
              $7_1 = $6_1;
             }
             $6_1 = $7_1;
            }
            $22_1 = $33_1 < Math_fround(0.0) ? Math_fround(-$33_1) : Math_fround(0.0);
            break block66;
           }
           $22_1 = Math_fround($6_1 - $33_1);
          }
          $7_1 = $6_1;
          if (!$55_1) {
           block67 : {
            if (($9 | 0) == ($47_1 | 0)) {
             $33_1 = Math_fround(0.0);
             break block67;
            }
            $19_1 = $46_1 > Math_fround(0.0) ? ($46_1 < Math_fround(1.0) ? Math_fround(1.0) : $46_1) : $46_1;
            $33_1 = Math_fround(0.0);
            $14_1 = $9;
            while (1) {
             $17_1 = HEAP32[$14_1 >> 2];
             $15_1 = HEAPF32[$17_1 + 156 >> 2];
             $11_1 = $17_1 + 20 | 0;
             $28_1 = $23($11_1, $16_1, $64_1, $56_1, $24_1);
             $6_1 = $15($11_1, $16_1, $64_1, $56_1, $24_1);
             block68 : {
              if ($6_1 >= Math_fround(0.0) & $6_1 < $15_1) {
               break block68
              }
              if (!($28_1 >= Math_fround(0.0))) {
               $6_1 = $15_1;
               break block68;
              }
              $6_1 = $15_1 < $28_1 ? $28_1 : $15_1;
             }
             block69 : {
              if ($22_1 < Math_fround(0.0)) {
               $15_1 = Math_fround($6_1 * Math_fround(-$34($17_1)));
               if (!($15_1 > Math_fround(0.0) | $15_1 < Math_fround(0.0))) {
                break block69
               }
               $15_1 = Math_fround(Math_fround(Math_fround($22_1 / $19_1) * $15_1) + $6_1);
               $28_1 = $7($17_1, $27_1, $16_1, $15_1, $7_1, $20_1);
               if ($15_1 != $15_1 | $28_1 != $28_1 | $15_1 == $28_1) {
                break block69
               }
               $33_1 = Math_fround($33_1 + Math_fround($28_1 - $6_1));
               $19_1 = Math_fround(Math_fround($34($17_1) * HEAPF32[$17_1 + 156 >> 2]) + $19_1);
               break block69;
              }
              if (!($22_1 > Math_fround(0.0))) {
               break block69
              }
              $28_1 = $29($17_1);
              if (!($28_1 > Math_fround(0.0) | $28_1 < Math_fround(0.0))) {
               break block69
              }
              $15_1 = Math_fround(Math_fround(Math_fround($22_1 / $18_1) * $28_1) + $6_1);
              $34_1 = $7($17_1, $27_1, $16_1, $15_1, $7_1, $20_1);
              if ($15_1 != $15_1 | $34_1 != $34_1 | $15_1 == $34_1) {
               break block69
              }
              $18_1 = Math_fround($18_1 - $28_1);
              $33_1 = Math_fround($33_1 + Math_fround($34_1 - $6_1));
             }
             $14_1 = $14_1 + 4 | 0;
             if (($47_1 | 0) != ($14_1 | 0)) {
              continue
             }
             break;
            };
            $72_1 = Math_fround($22_1 - $33_1);
            $46_1 = Math_fround($72_1 / $19_1);
            $58_1 = Math_fround($72_1 / $18_1);
            $39_1 = !((HEAPU8[$0_1 + 21 | 0] | HEAPU8[$0_1 + 22 | 0] << 8) & 49152) | $85_1;
            $33_1 = Math_fround(0.0);
            $11_1 = $9;
            while (1) {
             $25_1 = HEAP32[$11_1 >> 2];
             $18_1 = HEAPF32[$25_1 + 156 >> 2];
             $29_1 = $25_1 + 20 | 0;
             $15_1 = $23($29_1, $16_1, $64_1, $56_1, $24_1);
             $6_1 = $15($29_1, $16_1, $64_1, $56_1, $24_1);
             block70 : {
              if ($6_1 >= Math_fround(0.0) & $6_1 < $18_1) {
               break block70
              }
              if (!($15_1 >= Math_fround(0.0))) {
               $6_1 = $18_1;
               break block70;
              }
              $6_1 = $15_1 > $18_1 ? $15_1 : $18_1;
             }
             block71 : {
              block72 : {
               if ($72_1 < Math_fround(0.0)) {
                $18_1 = Math_fround($6_1 * Math_fround(-$34($25_1)));
                $15_1 = $6_1;
                if ($18_1 == Math_fround(0.0)) {
                 break block71
                }
                $15_1 = Math_fround($6_1 + $18_1);
                if ($19_1 == Math_fround(0.0)) {
                 break block72
                }
                $15_1 = Math_fround(Math_fround($46_1 * $18_1) + $6_1);
                break block72;
               }
               $15_1 = $6_1;
               if (!($72_1 > Math_fround(0.0))) {
                break block71
               }
               $18_1 = $29($25_1);
               $15_1 = $6_1;
               if (!($18_1 > Math_fround(0.0) | $18_1 < Math_fround(0.0))) {
                break block71
               }
               $15_1 = Math_fround(Math_fround($58_1 * $18_1) + $6_1);
              }
              $15_1 = $7($25_1, $27_1, $16_1, $15_1, $7_1, $20_1);
             }
             $43_1 = $15_1;
             $28_1 = $4($29_1, $27_1, 1, $20_1);
             $15_1 = $3($29_1, $27_1, 1, $20_1);
             $34_1 = $4($29_1, $31_1, 1, $20_1);
             $18_1 = $3($29_1, $31_1, 1, $20_1);
             $28_1 = Math_fround($28_1 + $15_1);
             $15_1 = Math_fround($43_1 + $28_1);
             HEAPF32[$13_1 + 104 >> 2] = $15_1;
             HEAP32[$13_1 + 96 >> 2] = 0;
             $74_1 = Math_fround($34_1 + $18_1);
             $14_1 = $25_1 + 124 | 0;
             $18_1 = $2($14_1, HEAPU16[$25_1 + 122 >> 1]);
             block73 : {
              if ($18_1 == $18_1) {
               $34_1 = $2($14_1, HEAPU16[$25_1 + 122 >> 1]);
               HEAP32[$13_1 + 100 >> 2] = 0;
               $18_1 = Math_fround($15_1 - $28_1);
               HEAPF32[$13_1 + 120 >> 2] = $74_1 + ($64_1 ? Math_fround($18_1 * $34_1) : Math_fround($18_1 / $34_1));
               break block73;
              }
              $17_1 = HEAP32[$73_1 >> 2];
              block74 : {
               if ($80_1) {
                break block74
               }
               $14_1 = $25_1 + ($17_1 << 3) | 0;
               $15_1 = HEAPF32[$14_1 + 504 >> 2];
               $23_1 = 0;
               block77 : {
                block75 : {
                 switch (HEAPU8[$14_1 + 508 | 0] - 1 | 0) {
                 case 1:
                  $15_1 = Math_fround(Math_fround($35_1 * $15_1) * Math_fround(.009999999776482582));
                  break;
                 case 0:
                  break block75;
                 default:
                  break block77;
                 };
                }
                if ($15_1 != $15_1) {
                 break block77
                }
                $23_1 = $15_1 >= Math_fround(0.0);
               }
               if (!($39_1 & (($23_1 ^ 1) & $49_1))) {
                break block74
               }
               $14_1 = (HEAPU8[$25_1 + 22 | 0] | HEAPU8[$25_1 + 23 | 0] << 8) & 15;
               if (!$14_1) {
                $14_1 = HEAPU8[$0_1 + 21 | 0] >>> 4 | 0
               }
               if (($14_1 | 0) != 4) {
                break block74
               }
               $14_1 = $13_1 + 136 | 0;
               $10($14_1, $29_1, HEAP32[$71_1 >> 2], $16_1);
               if (HEAPU8[$13_1 + 140 | 0] == 3) {
                break block74
               }
               $10($14_1, $29_1, HEAP32[$70_1 >> 2], $16_1);
               if (HEAPU8[$13_1 + 140 | 0] == 3) {
                break block74
               }
               HEAP32[$13_1 + 100 >> 2] = 0;
               HEAPF32[$13_1 + 120 >> 2] = $35_1;
               break block73;
              }
              $23_1 = $25_1 + 504 | 0;
              $14_1 = $23_1 + ($17_1 << 3) | 0;
              $15_1 = HEAPF32[$14_1 >> 2];
              block81 : {
               block80 : {
                switch (HEAPU8[$14_1 + 4 | 0] - 1 | 0) {
                case 1:
                 $15_1 = Math_fround(Math_fround($35_1 * $15_1) * Math_fround(.009999999776482582));
                case 0:
                 if ($15_1 >= Math_fround(0.0)) {
                  break block81
                 }
                 break;
                default:
                 break block80;
                };
               }
               HEAP32[$13_1 + 100 >> 2] = $84_1;
               HEAPF32[$13_1 + 120 >> 2] = $35_1;
               break block73;
              }
              block86 : {
               block85 : {
                switch ($31_1 - 2 | 0) {
                default:
                 $17_1 = 1;
                 $15_1 = Math_fround($74_1 + $19($25_1, $16_1, 1, $35_1, $20_1));
                 HEAPF32[$13_1 + 120 >> 2] = $15_1;
                 if ($27_1 >>> 0 <= 1) {
                  break block11
                 }
                 break block86;
                case 0:
                case 1:
                 break block85;
                };
               }
               $17_1 = 0;
               $15_1 = Math_fround($74_1 + $19($25_1, $16_1, 0, $35_1, $20_1));
               HEAPF32[$13_1 + 120 >> 2] = $15_1;
              }
              HEAP32[$13_1 + 100 >> 2] = HEAPU8[($23_1 + ($17_1 << 3) | 0) + 4 | 0] == 2 & $52_1 | $15_1 != $15_1;
             }
             $33($25_1, $16_1, $27_1, $7_1, $20_1, $13_1 + 96 | 0, $13_1 + 104 | 0);
             $33($25_1, $16_1, $31_1, $35_1, $20_1, $13_1 + 100 | 0, $13_1 + 120 | 0);
             $14_1 = $25_1 + (HEAP32[$73_1 >> 2] << 3) | 0;
             $15_1 = HEAPF32[$14_1 + 504 >> 2];
             block90 : {
              block89 : {
               switch (HEAPU8[$14_1 + 508 | 0] - 1 | 0) {
               case 1:
                $15_1 = Math_fround(Math_fround($35_1 * $15_1) * Math_fround(.009999999776482582));
               case 0:
                $17_1 = 1;
                if ($15_1 >= Math_fround(0.0)) {
                 break block90
                }
                break;
               default:
                break block89;
               };
              }
              $17_1 = 1;
              $14_1 = (HEAPU8[$25_1 + 22 | 0] | HEAPU8[$25_1 + 23 | 0] << 8) & 15;
              if (!$14_1) {
               $14_1 = HEAPU8[$0_1 + 21 | 0] >>> 4 | 0
              }
              if (($14_1 | 0) != 4) {
               break block90
              }
              $14_1 = $13_1 + 136 | 0;
              $10($14_1, $29_1, HEAP32[$71_1 >> 2], $16_1);
              if (HEAPU8[$13_1 + 140 | 0] == 3) {
               break block90
              }
              $10($14_1, $29_1, HEAP32[$70_1 >> 2], $16_1);
              $17_1 = HEAPU8[$13_1 + 140 | 0] == 3;
             }
             $15_1 = HEAPF32[$13_1 + 104 >> 2];
             $18_1 = HEAPF32[$13_1 + 120 >> 2];
             $29_1 = $27_1 >>> 0 > 1;
             $23_1 = HEAP32[$13_1 + 96 >> 2];
             $14_1 = HEAP32[$13_1 + 100 >> 2];
             $36_1 = $29_1 ? $23_1 : $14_1;
             $23_1 = $29_1 ? $14_1 : $23_1;
             $14_1 = $8_1 & $17_1;
             $31($25_1, $29_1 ? $15_1 : $18_1, $29_1 ? $18_1 : $15_1, HEAPU8[$0_1 + 392 | 0] & 3, $36_1, $23_1, $20_1, $40_1, $14_1, $14_1 ? 4 : 7, $10_1, $65_1, $12_1);
             $33_1 = Math_fround($33_1 + Math_fround($43_1 - $6_1));
             $14_1 = HEAPU8[$0_1 + 392 | 0];
             block91 : {
              if (!($14_1 & 4)) {
               $17_1 = 0;
               if (!(HEAPU8[$25_1 + 392 | 0] & 4)) {
                break block91
               }
              }
              $17_1 = 4;
             }
             HEAP8[$0_1 + 392 | 0] = $17_1 | $14_1 & 251;
             $11_1 = $11_1 + 4 | 0;
             if (($47_1 | 0) != ($11_1 | 0)) {
              continue
             }
             break;
            };
           }
           $22_1 = Math_fround($22_1 - $33_1);
          }
          $11_1 = HEAPU8[$0_1 + 392 | 0];
          HEAP8[$0_1 + 392 | 0] = $11_1 & 251 | (($11_1 & 4) >>> 2 | 0 ? 4 : ($22_1 < Math_fround(0.0)) << 2);
          $15_1 = Math_fround($66($30_1, $27_1, $16_1, $24_1) + $45($30_1, $27_1, $16_1));
          $46_1 = Math_fround($97($30_1, $27_1, $16_1, $24_1) + $52($30_1, $27_1, $16_1));
          $43_1 = $47($30_1, $27_1, $7_1);
          block95 : {
           block94 : {
            block93 : {
             if (!(!($22_1 > Math_fround(0.0)) | ($67_1 | 0) != 2)) {
              $1($13_1 + 136 | 0, $37_1, HEAPU16[(HEAP32[$81_1 >> 2] << 1) + $26_1 >> 1]);
              block92 : {
               if (HEAPU8[$13_1 + 140 | 0]) {
                $6_1 = $23($30_1, $16_1, $83_1, $56_1, $24_1);
                if ($6_1 == $6_1) {
                 break block92
                }
               }
               $18_1 = Math_fround(0.0);
               break block93;
              }
              $22_1 = Math_fround(Math_fround(Math_fround($23($30_1, $16_1, $83_1, $56_1, $24_1) - $15_1) - $46_1) - Math_fround($7_1 - $22_1));
              $18_1 = Math_fround(0.0);
              if (!($22_1 > Math_fround(0.0))) {
               break block93
              }
             }
             if (!($22_1 >= Math_fround(0.0))) {
              break block94
             }
             $18_1 = $22_1;
            }
            $11_1 = HEAPU8[$30_1 | 0] >>> 4 & 7;
            break block95;
           }
           $18_1 = $22_1;
           $11_1 = HEAPU8[$30_1 | 0] >>> 4 & 7;
           $11_1 = $11_1 - 3 >>> 0 >= 3 ? $11_1 : 0;
          }
          $6_1 = Math_fround(0.0);
          block102 : {
           block96 : {
            if ($45_1) {
             break block96
            }
            $19_1 = Math_fround(0.0);
            block100 : {
             switch ($11_1 - 1 | 0) {
             case 0:
              $19_1 = Math_fround($18_1 * Math_fround(.5));
              break block102;
             case 1:
              $19_1 = $18_1;
              break block102;
             case 2:
              $11_1 = $47_1 - $9 | 0;
              if ($11_1 >>> 0 < 5) {
               break block96
              }
              $43_1 = Math_fround($43_1 + Math_fround($18_1 / Math_fround(($11_1 >> 2) - 1 >>> 0)));
              break block96;
             case 4:
              $19_1 = Math_fround($18_1 / Math_fround(($47_1 - $9 >> 2) + 1 >>> 0));
              $43_1 = Math_fround($43_1 + $19_1);
              break block102;
             case 3:
              break block100;
             default:
              break block102;
             };
            }
            $19_1 = Math_fround(Math_fround($18_1 * Math_fround(.5)) / Math_fround($47_1 - $9 >> 2 >>> 0));
            $43_1 = Math_fround(Math_fround($19_1 + $19_1) + $43_1);
            break block102;
           }
           $19_1 = Math_fround(0.0);
          }
          $19_1 = Math_fround($15_1 + $19_1);
          $29_1 = $94($0_1);
          $39_1 = ($9 | 0) == ($47_1 | 0);
          block103 : {
           if ($39_1) {
            $22_1 = Math_fround(0.0);
            $15_1 = Math_fround(0.0);
            break block103;
           }
           $23_1 = $47_1 - 4 | 0;
           $58_1 = Math_fround($18_1 / Math_fround($45_1 >>> 0));
           $17_1 = HEAP32[$53_1 >> 2];
           $15_1 = Math_fround(0.0);
           $22_1 = Math_fround(0.0);
           $11_1 = $9;
           while (1) {
            $36_1 = HEAP32[$11_1 >> 2];
            $25_1 = $36_1 + 20 | 0;
            $10($13_1 + 136 | 0, $25_1, $17_1, $16_1);
            $33_1 = $19_1;
            $19_1 = $18_1 > Math_fround(0.0) ? $58_1 : Math_fround(-0.0);
            $28_1 = Math_fround($33_1 + (HEAPU8[$13_1 + 140 | 0] != 3 ? Math_fround(-0.0) : $19_1));
            if ($8_1) {
             block108 : {
              block106 : {
               switch ($27_1 - 1 | 0) {
               default:
                $45_1 = 1;
                $14_1 = $36_1 + 416 | 0;
                break block108;
               case 0:
                $45_1 = 3;
                $14_1 = $36_1 + 424 | 0;
                break block108;
               case 1:
                $45_1 = 0;
                $14_1 = $36_1 + 412 | 0;
                break block108;
               case 2:
                break block106;
               };
              }
              $45_1 = 2;
              $14_1 = $36_1 + 420 | 0;
             }
             HEAPF32[($36_1 + ($45_1 << 2) | 0) + 412 >> 2] = HEAPF32[$14_1 >> 2] + $28_1;
            }
            $14_1 = HEAP32[$23_1 >> 2];
            $10($13_1 + 136 | 0, $25_1, HEAP32[$50_1 >> 2], $16_1);
            $19_1 = Math_fround(Math_fround($28_1 + (($14_1 | 0) == ($36_1 | 0) ? Math_fround(-0.0) : $43_1)) + (HEAPU8[$13_1 + 140 | 0] != 3 ? Math_fround(-0.0) : $19_1));
            block109 : {
             if (!$42_1) {
              $19_1 = Math_fround($19_1 + Math_fround(Math_fround($4($25_1, $27_1, 1, $20_1) + $3($25_1, $27_1, 1, $20_1)) + HEAPF32[$36_1 + 156 >> 2]));
              $6_1 = $35_1;
              break block109;
             }
             $19_1 = Math_fround($63($36_1, $27_1, $20_1) + $19_1);
             if ($29_1) {
              $34_1 = $48($36_1);
              $28_1 = $35($25_1, 0, $16_1, $20_1);
              $34_1 = Math_fround($34_1 + $28_1);
              $28_1 = Math_fround(Math_fround(HEAPF32[$36_1 + 408 >> 2] + Math_fround($4($25_1, 0, 1, $20_1) + $3($25_1, 0, 1, $20_1))) - $34_1);
              $22_1 = $22_1 == $22_1 & $28_1 == $28_1 ? ($22_1 < $28_1 ? $28_1 : $22_1) : $22_1 != $22_1 ? $28_1 : $22_1;
              $15_1 = $15_1 == $15_1 & $34_1 == $34_1 ? ($15_1 < $34_1 ? $34_1 : $15_1) : $15_1 != $15_1 ? $34_1 : $15_1;
              break block109;
             }
             $28_1 = $63($36_1, $31_1, $20_1);
             $6_1 = $6_1 == $6_1 & $28_1 == $28_1 ? ($6_1 < $28_1 ? $28_1 : $6_1) : $6_1 != $6_1 ? $28_1 : $6_1;
            }
            $11_1 = $11_1 + 4 | 0;
            if (($47_1 | 0) != ($11_1 | 0)) {
             continue
            }
            break;
           };
          }
          $33_1 = $29_1 ? Math_fround($22_1 + $15_1) : $6_1;
          block110 : {
           if ($38_1) {
            $15_1 = Math_fround($7($0_1, $31_1, $16_1, Math_fround($44_1 + $33_1), $66_1, $24_1) - $44_1);
            break block110;
           }
           $33_1 = $59_1 ? $35_1 : $33_1;
           $15_1 = $35_1;
          }
          if (!$69_1) {
           $33_1 = Math_fround($7($0_1, $31_1, $16_1, Math_fround($44_1 + $33_1), $66_1, $24_1) - $44_1)
          }
          $22_1 = Math_fround($46_1 + $19_1);
          block111 : {
           if (!$8_1) {
            break block111
           }
           $11_1 = $9;
           if ($39_1) {
            break block111
           }
           while (1) {
            $25_1 = HEAP32[$11_1 >> 2];
            $14_1 = (HEAPU8[$25_1 + 22 | 0] | HEAPU8[$25_1 + 23 | 0] << 8) & 15;
            if (!$14_1) {
             $14_1 = HEAPU8[$0_1 + 21 | 0] >>> 4 | 0
            }
            block118 : {
             block114 : {
              block113 : {
               switch ($14_1 - 4 | 0) {
               case 0:
                $17_1 = $13_1 + 136 | 0;
                $23_1 = $25_1 + 20 | 0;
                $10($17_1, $23_1, HEAP32[$71_1 >> 2], $16_1);
                $14_1 = 4;
                if (HEAPU8[$13_1 + 140 | 0] == 3) {
                 break block114
                }
                $10($17_1, $23_1, HEAP32[$70_1 >> 2], $16_1);
                if (HEAPU8[$13_1 + 140 | 0] == 3) {
                 break block114
                }
                $14_1 = $25_1 + (HEAP32[$73_1 >> 2] << 3) | 0;
                $19_1 = HEAPF32[$14_1 + 504 >> 2];
                block117 : {
                 switch (HEAPU8[$14_1 + 508 | 0] - 1 | 0) {
                 case 1:
                  $19_1 = Math_fround(Math_fround($35_1 * $19_1) * Math_fround(.009999999776482582));
                 case 0:
                  $6_1 = $21_1;
                  if ($19_1 >= Math_fround(0.0)) {
                   break block118
                  }
                  break;
                 default:
                  break block117;
                 };
                }
                $18_1 = HEAPF32[($25_1 + (HEAP32[$81_1 >> 2] << 2) | 0) + 404 >> 2];
                $14_1 = $25_1 + 124 | 0;
                $6_1 = $2($14_1, HEAPU16[$25_1 + 122 >> 1]);
                if ($6_1 == $6_1) {
                 $19_1 = Math_fround($4($23_1, $31_1, 1, $20_1) + $3($23_1, $31_1, 1, $20_1));
                 $6_1 = $2($14_1, HEAPU16[$25_1 + 122 >> 1]);
                 $6_1 = Math_fround($19_1 + ($64_1 ? Math_fround($18_1 * $6_1) : Math_fround($18_1 / $6_1)));
                } else {
                 $6_1 = $33_1
                }
                HEAPF32[$13_1 + 120 >> 2] = $6_1;
                (wasm2js_i32$0 = $13_1, wasm2js_f32$0 = Math_fround($18_1 + Math_fround($4($23_1, $27_1, 1, $20_1) + $3($23_1, $27_1, 1, $20_1)))), HEAPF32[wasm2js_i32$0 + 136 >> 2] = wasm2js_f32$0;
                HEAP32[$13_1 + 104 >> 2] = 0;
                HEAP32[$13_1 + 100 >> 2] = 0;
                $33($25_1, $16_1, $27_1, $7_1, $20_1, $13_1 + 104 | 0, $13_1 + 136 | 0);
                $33($25_1, $16_1, $31_1, $35_1, $20_1, $13_1 + 100 | 0, $13_1 + 120 | 0);
                $18_1 = HEAPF32[$13_1 + 120 >> 2];
                $6_1 = HEAPF32[$13_1 + 136 >> 2];
                $17_1 = $27_1 >>> 0 > 1;
                $19_1 = $17_1 ? $18_1 : $6_1;
                $6_1 = $17_1 ? $6_1 : $18_1;
                $14_1 = ($69_1 | 0) != 0 & ((HEAPU8[$0_1 + 21 | 0] | HEAPU8[$0_1 + 22 | 0] << 8) & 15) != 4;
                $31($25_1, $6_1, $19_1, $16_1, $14_1 & $64_1 | $6_1 != $6_1, $14_1 & $17_1 | $19_1 != $19_1, $20_1, $40_1, 1, 2, $10_1, $65_1, $12_1);
                $6_1 = $21_1;
                break block118;
               case 1:
                break block113;
               default:
                break block114;
               };
              }
              $14_1 = HEAPU8[$30_1 | 0] & 8 ? 5 : 1;
             }
             $6_1 = $63($25_1, $31_1, $20_1);
             $29_1 = $25_1 + 20 | 0;
             $39_1 = HEAP32[$71_1 >> 2];
             $10($13_1 + 136 | 0, $29_1, $39_1, $16_1);
             $18_1 = Math_fround($15_1 - $6_1);
             block119 : {
              if (HEAPU8[$13_1 + 140 | 0] != 3) {
               $23_1 = HEAP32[$70_1 >> 2];
               break block119;
              }
              $23_1 = HEAP32[$70_1 >> 2];
              $10($13_1 + 136 | 0, $29_1, $23_1, $16_1);
              if (HEAPU8[$13_1 + 140 | 0] != 3) {
               break block119
              }
              $6_1 = Math_fround($18_1 * Math_fround(.5));
              $6_1 = Math_fround($21_1 + ($6_1 > Math_fround(0.0) ? $6_1 : Math_fround(0.0)));
              break block118;
             }
             $17_1 = $13_1 + 136 | 0;
             $10($17_1, $29_1, $23_1, $16_1);
             $6_1 = $21_1;
             if (HEAPU8[$13_1 + 140 | 0] == 3) {
              break block118
             }
             $10($17_1, $29_1, $39_1, $16_1);
             if (HEAPU8[$13_1 + 140 | 0] == 3) {
              $6_1 = Math_fround($6_1 + ($18_1 > Math_fround(0.0) ? $18_1 : Math_fround(0.0)));
              break block118;
             }
             block121 : {
              switch ($14_1 - 1 | 0) {
              case 1:
               $6_1 = Math_fround($21_1 + Math_fround($18_1 * Math_fround(.5)));
               break block118;
              case 0:
               break block118;
              default:
               break block121;
              };
             }
             $6_1 = Math_fround($21_1 + $18_1);
            }
            block126 : {
             block124 : {
              switch ($31_1 - 1 | 0) {
              default:
               $17_1 = 1;
               $14_1 = $25_1 + 416 | 0;
               break block126;
              case 0:
               $17_1 = 3;
               $14_1 = $25_1 + 424 | 0;
               break block126;
              case 1:
               $17_1 = 0;
               $14_1 = $25_1 + 412 | 0;
               break block126;
              case 2:
               break block124;
              };
             }
             $17_1 = 2;
             $14_1 = $25_1 + 420 | 0;
            }
            HEAPF32[($25_1 + ($17_1 << 2) | 0) + 412 >> 2] = $6_1 + Math_fround($68_1 + HEAPF32[$14_1 >> 2]);
            $11_1 = $11_1 + 4 | 0;
            if (($47_1 | 0) != ($11_1 | 0)) {
             continue
            }
            break;
           };
          }
          if ($9) {
           $5($9)
          }
          $60_1 = $60_1 == $60_1 & $22_1 == $22_1 ? ($22_1 > $60_1 ? $22_1 : $60_1) : $60_1 != $60_1 ? $22_1 : $60_1;
          $68_1 = Math_fround($68_1 + Math_fround(($57_1 ? $79_1 : Math_fround(0.0)) + $33_1));
          $57_1 = $57_1 + 1 | 0;
          $9 = HEAP32[$13_1 + 80 >> 2];
          if ($32_1 | $9) {
           continue
          }
          break;
         };
        }
        block127 : {
         if (!$8_1) {
          break block127
         }
         if (!$69_1) {
          if (!$94($0_1)) {
           break block127
          }
         }
         $6_1 = Math_fround($44_1 + $35_1);
         block128 : {
          if (!$63_1) {
           break block128
          }
          $9 = (HEAP32[($31_1 << 2) + 4860 >> 2] << 3) + $0_1 | 0;
          $6_1 = HEAPF32[$9 + 504 >> 2];
          block131 : {
           block129 : {
            switch (HEAPU8[$9 + 508 | 0] - 1 | 0) {
            case 1:
             $6_1 = Math_fround(Math_fround($66_1 * $6_1) * Math_fround(.009999999776482582));
             break;
            case 0:
             break block129;
            default:
             break block131;
            };
           }
           if (!($6_1 >= Math_fround(0.0))) {
            break block131
           }
           $6_1 = $19($0_1, $16_1, 257 >>> ($31_1 << 3) & 1, $66_1, $24_1);
           break block128;
          }
          $6_1 = Math_fround($44_1 + $68_1);
         }
         $6_1 = $7($0_1, $31_1, $16_1, $6_1, $51_1, $24_1);
         $18_1 = Math_fround(0.0);
         $9 = (HEAPU8[$0_1 + 21 | 0] | HEAPU8[$0_1 + 22 | 0] << 8) & 15;
         block140 : {
          block139 : {
           block134 : {
            block135 : {
             block136 : {
              block138 : {
               block137 : {
                block132 : {
                 block133 : {
                  $15_1 = Math_fround(Math_fround($6_1 - $44_1) - $68_1);
                  if (!($15_1 >= Math_fround(0.0))) {
                   $46_1 = Math_fround(0.0);
                   switch ($9 - 2 | 0) {
                   case 0:
                    break block132;
                   case 1:
                    break block133;
                   default:
                    break block134;
                   };
                  }
                  $46_1 = Math_fround(0.0);
                  switch ($9 - 2 | 0) {
                  case 0:
                   break block132;
                  case 1:
                   break block133;
                  case 2:
                   break block135;
                  case 4:
                   break block136;
                  case 5:
                   break block137;
                  case 6:
                   break block138;
                  default:
                   break block134;
                  };
                 }
                 $21_1 = Math_fround($21_1 + $15_1);
                 break block134;
                }
                $21_1 = Math_fround($21_1 + Math_fround($15_1 * Math_fround(.5)));
                break block134;
               }
               $6_1 = Math_fround($57_1 >>> 0);
               $18_1 = Math_fround($15_1 / $6_1);
               $21_1 = Math_fround($21_1 + Math_fround($15_1 / Math_fround($6_1 + $6_1)));
               break block134;
              }
              $18_1 = Math_fround($15_1 / Math_fround($57_1 + 1 >>> 0));
              $21_1 = Math_fround($21_1 + $18_1);
              break block134;
             }
             if ($57_1 >>> 0 < 2) {
              break block134
             }
             $20($13_1 + 136 | 0, $0_1);
             $18_1 = Math_fround($15_1 / Math_fround($57_1 - 1 >>> 0));
             break block139;
            }
            $46_1 = Math_fround($15_1 / Math_fround($57_1 >>> 0));
           }
           $20($13_1 + 136 | 0, $0_1);
           if (!$57_1) {
            break block140
           }
          }
          $9 = $31_1 << 2;
          $49_1 = $9 + 4828 | 0;
          $55_1 = $9 + 4860 | 0;
          $62_1 = $13_1 + 56 | 0;
          $38_1 = $13_1 + 72 | 0;
          $59_1 = $13_1 + 112 | 0;
          $29_1 = $13_1 + 144 | 0;
          $39_1 = $13_1 + 128 | 0;
          $23_1 = 0;
          while (1) {
           HEAP32[$13_1 + 128 >> 2] = 0;
           $9 = HEAP32[$13_1 + 140 >> 2];
           HEAP32[$13_1 + 120 >> 2] = HEAP32[$13_1 + 136 >> 2];
           HEAP32[$13_1 + 124 >> 2] = $9;
           $30($39_1, HEAP32[$13_1 + 144 >> 2]);
           HEAP32[$13_1 + 112 >> 2] = 0;
           $9 = HEAP32[$13_1 + 124 >> 2];
           $32_1 = $9;
           $17_1 = HEAP32[$13_1 + 120 >> 2];
           HEAP32[$13_1 + 104 >> 2] = $17_1;
           HEAP32[$13_1 + 108 >> 2] = $9;
           $11_1 = HEAP32[$13_1 + 128 >> 2];
           $30($59_1, $11_1);
           $9 = HEAP32[$13_1 + 108 >> 2];
           $14_1 = HEAP32[$13_1 + 104 >> 2];
           block142 : {
            block141 : {
             if ($14_1) {
              $15_1 = Math_fround(0.0);
              $22_1 = Math_fround(0.0);
              $6_1 = Math_fround(0.0);
              break block141;
             }
             $15_1 = Math_fround(0.0);
             $22_1 = Math_fround(0.0);
             $6_1 = Math_fround(0.0);
             if (!$9) {
              break block142
             }
            }
            while (1) {
             $25_1 = HEAP32[$14_1 + 492 >> 2];
             $14_1 = HEAP32[$14_1 + 488 >> 2];
             if ($25_1 - $14_1 >> 2 >>> 0 <= $9 >>> 0) {
              break block22
             }
             $42_1 = HEAP32[$14_1 + ($9 << 2) >> 2];
             $9 = HEAPU8[$42_1 + 21 | 0] | HEAPU8[$42_1 + 22 | 0] << 8 | HEAPU8[$42_1 + 23 | 0] << 16;
             block143 : {
              if (($9 & 786432) == 262144 | ($9 & 12288) == 8192) {
               break block143
              }
              if (HEAP32[$42_1 + 476 >> 2] != ($23_1 | 0)) {
               break block142
              }
              $14_1 = $42_1 + 20 | 0;
              $19_1 = HEAPF32[($42_1 + (HEAP32[$55_1 >> 2] << 2) | 0) + 404 >> 2];
              if ($19_1 >= Math_fround(0.0)) {
               $19_1 = Math_fround($19_1 + Math_fround($4($14_1, $31_1, 1, $20_1) + $3($14_1, $31_1, 1, $20_1)));
               $6_1 = $6_1 == $6_1 & $19_1 == $19_1 ? ($6_1 < $19_1 ? $19_1 : $6_1) : $6_1 != $6_1 ? $19_1 : $6_1;
               $9 = HEAPU8[$42_1 + 22 | 0];
              } else {
               $9 = $9 >>> 8 | 0
              }
              $9 = $9 & 15;
              if (!$9) {
               $9 = HEAPU8[$0_1 + 21 | 0] >>> 4 | 0
              }
              if (!(HEAPU8[$30_1 | 0] & 8) | ($9 | 0) != 5) {
               break block143
              }
              $19_1 = Math_fround($48($42_1) + $35($14_1, 0, $16_1, $20_1));
              $22_1 = $22_1 == $22_1 & $19_1 == $19_1 ? ($19_1 > $22_1 ? $19_1 : $22_1) : $22_1 != $22_1 ? $19_1 : $22_1;
              $19_1 = Math_fround(Math_fround(HEAPF32[$42_1 + 408 >> 2] + Math_fround($4($14_1, 0, 1, $20_1) + $3($14_1, 0, 1, $20_1))) - $19_1);
              $15_1 = $15_1 == $15_1 & $19_1 == $19_1 ? ($15_1 < $19_1 ? $19_1 : $15_1) : $15_1 != $15_1 ? $19_1 : $15_1;
              $19_1 = Math_fround($22_1 + $15_1);
              $6_1 = $6_1 == $6_1 & $19_1 == $19_1 ? ($6_1 < $19_1 ? $19_1 : $6_1) : $6_1 != $6_1 ? $19_1 : $6_1;
             }
             HEAP32[$13_1 + 72 >> 2] = 0;
             $9 = HEAP32[$13_1 + 108 >> 2];
             HEAP32[$13_1 + 64 >> 2] = HEAP32[$13_1 + 104 >> 2];
             HEAP32[$13_1 + 68 >> 2] = $9;
             $30($38_1, HEAP32[$13_1 + 112 >> 2]);
             $16($13_1 + 104 | 0);
             $9 = HEAP32[$13_1 + 72 >> 2];
             if ($9) {
              while (1) {
               $14_1 = HEAP32[$9 >> 2];
               $5($9);
               $9 = $14_1;
               if ($9) {
                continue
               }
               break;
              }
             }
             HEAP32[$13_1 + 72 >> 2] = 0;
             $9 = HEAP32[$13_1 + 108 >> 2];
             $14_1 = HEAP32[$13_1 + 104 >> 2];
             if ($9 | $14_1) {
              continue
             }
             break;
            };
           }
           $9 = HEAP32[$13_1 + 108 >> 2];
           HEAP32[$13_1 + 136 >> 2] = HEAP32[$13_1 + 104 >> 2];
           HEAP32[$13_1 + 140 >> 2] = $9;
           $87($29_1, HEAP32[$13_1 + 112 >> 2]);
           HEAP32[$13_1 + 104 >> 2] = $17_1;
           HEAP32[$13_1 + 108 >> 2] = $32_1;
           $87($59_1, $11_1);
           $58_1 = Math_fround($21_1 + ($23_1 ? $79_1 : Math_fround(0.0)));
           $34_1 = Math_fround($46_1 + $6_1);
           $14_1 = HEAP32[$13_1 + 104 >> 2];
           $9 = HEAP32[$13_1 + 108 >> 2];
           if (!(($14_1 | 0) == HEAP32[$13_1 + 136 >> 2] & ($9 | 0) == HEAP32[$13_1 + 140 >> 2])) {
            $28_1 = Math_fround($58_1 + $22_1);
            $19_1 = Math_fround($58_1 + $34_1);
            $6_1 = Math_fround($18_1 + $34_1);
            while (1) {
             $17_1 = HEAP32[$14_1 + 492 >> 2];
             $14_1 = HEAP32[$14_1 + 488 >> 2];
             if ($17_1 - $14_1 >> 2 >>> 0 <= $9 >>> 0) {
              break block22
             }
             $17_1 = HEAP32[$14_1 + ($9 << 2) >> 2];
             $9 = HEAPU8[$17_1 + 21 | 0] | HEAPU8[$17_1 + 22 | 0] << 8 | HEAPU8[$17_1 + 23 | 0] << 16;
             block145 : {
              if (($9 & 786432) == 262144 | ($9 & 12288) == 8192) {
               break block145
              }
              $14_1 = $17_1 + 20 | 0;
              block151 : {
               block149 : {
                block147 : {
                 block148 : {
                  block146 : {
                   block150 : {
                    $9 = $9 >>> 8 & 15;
                    if (!$9) {
                     $9 = HEAPU8[$0_1 + 21 | 0] >>> 4 | 0
                    }
                    switch ($9 - 1 | 0) {
                    case 0:
                     break block146;
                    case 1:
                     break block147;
                    case 2:
                     break block148;
                    case 3:
                     break block149;
                    case 4:
                     break block150;
                    default:
                     break block145;
                    };
                   }
                   if (HEAPU8[$30_1 | 0] & 8) {
                    break block151
                   }
                  }
                  $21_1 = $51($14_1, $31_1, $16_1, $20_1);
                  HEAPF32[($17_1 + (HEAP32[$49_1 >> 2] << 2) | 0) + 412 >> 2] = $58_1 + $21_1;
                  break block145;
                 }
                 $21_1 = $68($14_1, $31_1, $16_1, $20_1);
                 block155 : {
                  block152 : {
                   switch ($31_1 - 2 | 0) {
                   case 1:
                    $15_1 = HEAPF32[$17_1 + 404 >> 2];
                    $14_1 = 2;
                    break block155;
                   default:
                    $14_1 = 1;
                    $15_1 = HEAPF32[$17_1 + 408 >> 2];
                    block156 : {
                     switch ($31_1 | 0) {
                     case 0:
                      break block155;
                     case 1:
                      break block156;
                     default:
                      break block11;
                     };
                    }
                    $14_1 = 3;
                    break block155;
                   case 0:
                    break block152;
                   };
                  }
                  $15_1 = HEAPF32[$17_1 + 404 >> 2];
                  $14_1 = 0;
                 }
                 HEAPF32[($17_1 + ($14_1 << 2) | 0) + 412 >> 2] = Math_fround($19_1 - $21_1) - $15_1;
                 break block145;
                }
                block160 : {
                 block157 : {
                  switch ($31_1 - 2 | 0) {
                  case 1:
                   $22_1 = HEAPF32[$17_1 + 404 >> 2];
                   $14_1 = 2;
                   break block160;
                  default:
                   $14_1 = 1;
                   $22_1 = HEAPF32[$17_1 + 408 >> 2];
                   block161 : {
                    switch ($31_1 | 0) {
                    case 0:
                     break block160;
                    case 1:
                     break block161;
                    default:
                     break block11;
                    };
                   }
                   $14_1 = 3;
                   break block160;
                  case 0:
                   break block157;
                  };
                 }
                 $22_1 = HEAPF32[$17_1 + 404 >> 2];
                 $14_1 = 0;
                }
                HEAPF32[($17_1 + ($14_1 << 2) | 0) + 412 >> 2] = $58_1 + Math_fround(Math_fround($34_1 - $22_1) * Math_fround(.5));
                break block145;
               }
               $21_1 = $35($14_1, $31_1, $16_1, $20_1);
               HEAPF32[($17_1 + (HEAP32[$49_1 >> 2] << 2) | 0) + 412 >> 2] = $58_1 + $21_1;
               $9 = $17_1 + (HEAP32[$55_1 >> 2] << 3) | 0;
               $22_1 = HEAPF32[$9 + 504 >> 2];
               block164 : {
                switch (HEAPU8[$9 + 508 | 0] - 1 | 0) {
                case 1:
                 $22_1 = Math_fround(Math_fround($35_1 * $22_1) * Math_fround(.009999999776482582));
                case 0:
                 if ($22_1 >= Math_fround(0.0)) {
                  break block145
                 }
                 break;
                default:
                 break block164;
                };
               }
               block165 : {
                if ($27_1 >>> 0 <= 1) {
                 $15_1 = Math_fround(HEAPF32[$17_1 + 408 >> 2] + Math_fround($4($14_1, $31_1, 1, $20_1) + $3($14_1, $31_1, 1, $20_1)));
                 $22_1 = $6_1;
                 break block165;
                }
                $15_1 = $6_1;
                $22_1 = Math_fround(HEAPF32[$17_1 + 404 >> 2] + Math_fround($4($14_1, $27_1, 1, $20_1) + $3($14_1, $27_1, 1, $20_1)));
               }
               $21_1 = HEAPF32[$17_1 + 404 >> 2];
               block167 : {
                block166 : {
                 if (!($22_1 != $22_1 | $21_1 != $21_1)) {
                  if (Math_fround(Math_abs(Math_fround($22_1 - $21_1))) < Math_fround(9.999999747378752e-05)) {
                   break block166
                  }
                  break block167;
                 }
                 if ($22_1 == $22_1 | $21_1 == $21_1) {
                  break block167
                 }
                }
                $21_1 = HEAPF32[$17_1 + 408 >> 2];
                $9 = $21_1 != $21_1;
                if (!($9 | $15_1 != $15_1)) {
                 if (!(Math_fround(Math_abs(Math_fround($15_1 - $21_1))) < Math_fround(9.999999747378752e-05))) {
                  break block167
                 }
                 break block145;
                }
                if ($15_1 == $15_1) {
                 break block167
                }
                if ($9) {
                 break block145
                }
               }
               $31($17_1, $22_1, $15_1, $16_1, 0, 0, $20_1, $40_1, 1, 3, $10_1, $65_1, $12_1);
               break block145;
              }
              (wasm2js_i32$0 = $17_1, wasm2js_f32$0 = Math_fround(Math_fround($28_1 - $48($17_1)) + $51($14_1, 0, $16_1, $35_1))), HEAPF32[wasm2js_i32$0 + 416 >> 2] = wasm2js_f32$0;
             }
             HEAP32[$13_1 + 56 >> 2] = 0;
             $9 = HEAP32[$13_1 + 108 >> 2];
             HEAP32[$13_1 + 48 >> 2] = HEAP32[$13_1 + 104 >> 2];
             HEAP32[$13_1 + 52 >> 2] = $9;
             $30($62_1, HEAP32[$13_1 + 112 >> 2]);
             $16($13_1 + 104 | 0);
             $9 = HEAP32[$13_1 + 56 >> 2];
             if ($9) {
              while (1) {
               $14_1 = HEAP32[$9 >> 2];
               $5($9);
               $9 = $14_1;
               if ($9) {
                continue
               }
               break;
              }
             }
             HEAP32[$13_1 + 56 >> 2] = 0;
             $14_1 = HEAP32[$13_1 + 104 >> 2];
             $9 = HEAP32[$13_1 + 108 >> 2];
             if (($14_1 | 0) != HEAP32[$13_1 + 136 >> 2] | ($9 | 0) != HEAP32[$13_1 + 140 >> 2]) {
              continue
             }
             break;
            };
           }
           $9 = HEAP32[$13_1 + 112 >> 2];
           if ($9) {
            while (1) {
             $14_1 = HEAP32[$9 >> 2];
             $5($9);
             $9 = $14_1;
             if ($9) {
              continue
             }
             break;
            }
           }
           if ($11_1) {
            while (1) {
             $9 = HEAP32[$11_1 >> 2];
             $5($11_1);
             $11_1 = $9;
             if ($9) {
              continue
             }
             break;
            }
           }
           $21_1 = Math_fround(Math_fround($18_1 + $58_1) + $34_1);
           $23_1 = $23_1 + 1 | 0;
           if (($57_1 | 0) != ($23_1 | 0)) {
            continue
           }
           break;
          };
         }
         $9 = HEAP32[$13_1 + 144 >> 2];
         if (!$9) {
          break block127
         }
         while (1) {
          $11_1 = HEAP32[$9 >> 2];
          $5($9);
          $9 = $11_1;
          if ($9) {
           continue
          }
          break;
         };
        }
        $29_1 = $0_1 + 404 | 0;
        (wasm2js_i32$0 = $29_1, wasm2js_f32$0 = $7($0_1, 2, $16_1, $77_1, $24_1, $24_1)), HEAPF32[wasm2js_i32$0 >> 2] = wasm2js_f32$0;
        $39_1 = $0_1 + 408 | 0;
        (wasm2js_i32$0 = $39_1, wasm2js_f32$0 = $7($0_1, 0, $16_1, $78_1, $51_1, $24_1)), HEAPF32[wasm2js_i32$0 >> 2] = wasm2js_f32$0;
        $11_1 = $29_1 + ((257 >>> ($27_1 << 3) & 1) << 2) | 0;
        block170 : {
         block169 : {
          block168 : {
           if (($67_1 | 0) != 1) {
            $9 = HEAPU8[$0_1 + 23 | 0] & 3;
            if (($9 | 0) == 2 | ($67_1 | 0) != 2) {
             break block168
            }
           }
           $6_1 = $7($0_1, $27_1, $16_1, $60_1, $56_1, $24_1);
           break block169;
          }
          if (($67_1 | 0) != 2 | ($9 | 0) != 2) {
           break block170
          }
          $6_1 = $86($0_1, $16_1, $27_1, $60_1, $56_1, $24_1);
          $7_1 = Math_fround($54_1 + $7_1);
          $6_1 = $7_1 == $7_1 & $6_1 == $6_1 ? ($6_1 < $7_1 ? $6_1 : $7_1) : $7_1 != $7_1 ? $6_1 : $7_1;
          $6_1 = $6_1 == $6_1 & $54_1 == $54_1 ? ($6_1 < $54_1 ? $54_1 : $6_1) : $6_1 != $6_1 ? $54_1 : $6_1;
         }
         HEAPF32[$11_1 >> 2] = $6_1;
        }
        $14_1 = $29_1 + ((257 >>> ($31_1 << 3) & 1) << 2) | 0;
        block173 : {
         block172 : {
          block171 : {
           if (($63_1 | 0) != 1) {
            $11_1 = ($63_1 | 0) != 2;
            $9 = HEAPU8[$0_1 + 23 | 0] & 3;
            if ($11_1 | ($9 | 0) == 2) {
             break block171
            }
           }
           $6_1 = $7($0_1, $31_1, $16_1, Math_fround($44_1 + $68_1), $66_1, $24_1);
           break block172;
          }
          if ($11_1 | ($9 | 0) != 2) {
           break block173
          }
          $6_1 = $86($0_1, $16_1, $31_1, Math_fround($44_1 + $68_1), $66_1, $24_1);
          $7_1 = Math_fround($44_1 + $35_1);
          $6_1 = $7_1 == $7_1 & $6_1 == $6_1 ? ($6_1 < $7_1 ? $6_1 : $7_1) : $7_1 != $7_1 ? $6_1 : $7_1;
          $6_1 = $6_1 == $6_1 & $44_1 == $44_1 ? ($6_1 < $44_1 ? $44_1 : $6_1) : $6_1 != $6_1 ? $44_1 : $6_1;
         }
         HEAPF32[$14_1 >> 2] = $6_1;
        }
        block174 : {
         if (!$8_1) {
          break block174
         }
         block175 : {
          if (((HEAPU8[$0_1 + 21 | 0] | HEAPU8[$0_1 + 22 | 0] << 8) & 49152) != 32768) {
           break block175
          }
          $20($13_1 + 136 | 0, $0_1);
          while (1) {
           $11_1 = HEAP32[$13_1 + 140 >> 2];
           $9 = HEAP32[$13_1 + 136 >> 2];
           if (!($11_1 | $9)) {
            $9 = HEAP32[$13_1 + 144 >> 2];
            if (!$9) {
             break block175
            }
            while (1) {
             $11_1 = HEAP32[$9 >> 2];
             $5($9);
             $9 = $11_1;
             if ($9) {
              continue
             }
             break;
            };
            break block175;
           }
           $14_1 = HEAP32[$9 + 492 >> 2];
           $9 = HEAP32[$9 + 488 >> 2];
           if ($11_1 >>> 0 >= $14_1 - $9 >> 2 >>> 0) {
            break block22
           }
           $9 = HEAP32[$9 + ($11_1 << 2) >> 2];
           if (((HEAPU8[$9 + 21 | 0] | HEAPU8[$9 + 22 | 0] << 8) & 12288) != 8192) {
            block179 : {
             block178 : {
              switch ($31_1 - 2 | 0) {
              case 0:
               $14_1 = $9 + 404 | 0;
               $11_1 = 0;
               $6_1 = Math_fround(HEAPF32[$29_1 >> 2] - HEAPF32[$9 + 412 >> 2]);
               break block179;
              case 1:
               $14_1 = $9 + 404 | 0;
               $11_1 = 2;
               $6_1 = Math_fround(HEAPF32[$29_1 >> 2] - HEAPF32[$9 + 420 >> 2]);
               break block179;
              default:
               break block178;
              };
             }
             $6_1 = HEAPF32[$39_1 >> 2];
             block181 : {
              switch ($31_1 | 0) {
              case 0:
               $14_1 = $9 + 408 | 0;
               $11_1 = 1;
               $6_1 = Math_fround($6_1 - HEAPF32[$9 + 416 >> 2]);
               break block179;
              case 1:
               break block181;
              default:
               break block11;
              };
             }
             $14_1 = $9 + 408 | 0;
             $11_1 = 3;
             $6_1 = Math_fround($6_1 - HEAPF32[$9 + 424 >> 2]);
            }
            HEAPF32[(($11_1 << 2) + $9 | 0) + 412 >> 2] = $6_1 - HEAPF32[$14_1 >> 2];
           }
           $16($13_1 + 136 | 0);
           continue;
          };
         }
         block182 : {
          if (!(($27_1 | $31_1) & 1)) {
           break block182
          }
          $32_1 = $31_1 & 1;
          $17_1 = $27_1 & 1;
          $20($13_1 + 136 | 0, $0_1);
          while (1) {
           $11_1 = HEAP32[$13_1 + 140 >> 2];
           $9 = HEAP32[$13_1 + 136 >> 2];
           if (!($11_1 | $9)) {
            $9 = HEAP32[$13_1 + 144 >> 2];
            if (!$9) {
             break block182
            }
            while (1) {
             $11_1 = HEAP32[$9 >> 2];
             $5($9);
             $9 = $11_1;
             if ($9) {
              continue
             }
             break;
            };
            break block182;
           }
           $14_1 = HEAP32[$9 + 492 >> 2];
           $9 = HEAP32[$9 + 488 >> 2];
           if ($11_1 >>> 0 >= $14_1 - $9 >> 2 >>> 0) {
            break block22
           }
           $38_1 = HEAP32[$9 + ($11_1 << 2) >> 2];
           $9 = HEAPU8[$38_1 + 21 | 0] | HEAPU8[$38_1 + 22 | 0] << 8 | HEAPU8[$38_1 + 23 | 0] << 16;
           block183 : {
            if (($9 & 786432) == 262144 | ($9 & 12288) == 8192) {
             break block183
            }
            if ($17_1) {
             block187 : {
              block188 : {
               block186 : {
                switch ($27_1 - 1 | 0) {
                case 0:
                 $14_1 = $38_1 + 408 | 0;
                 $11_1 = $38_1 + 424 | 0;
                 $23_1 = 1;
                 $9 = $39_1;
                 break block187;
                case 1:
                 $14_1 = $38_1 + 404 | 0;
                 $23_1 = 2;
                 $11_1 = $38_1 + 412 | 0;
                 break block188;
                case 2:
                 break block186;
                default:
                 break block11;
                };
               }
               $14_1 = $38_1 + 404 | 0;
               $23_1 = 0;
               $11_1 = $38_1 + 420 | 0;
              }
              $9 = $29_1;
             }
             HEAPF32[($38_1 + ($23_1 << 2) | 0) + 412 >> 2] = Math_fround(HEAPF32[$9 >> 2] - HEAPF32[$14_1 >> 2]) - HEAPF32[$11_1 >> 2];
            }
            if (!$32_1) {
             break block183
            }
            block192 : {
             block193 : {
              block191 : {
               switch ($31_1 - 1 | 0) {
               case 0:
                $11_1 = $38_1 + 408 | 0;
                $23_1 = $38_1 + 424 | 0;
                $61_1 = 1;
                $9 = $39_1;
                break block192;
               case 1:
                $61_1 = 2;
                $23_1 = $38_1 + 412 | 0;
                break block193;
               case 2:
                break block191;
               default:
                break block11;
               };
              }
              $61_1 = 0;
              $23_1 = $38_1 + 420 | 0;
             }
             $11_1 = $38_1 + 404 | 0;
             $9 = $29_1;
            }
            HEAPF32[($38_1 + ($61_1 << 2) | 0) + 412 >> 2] = Math_fround(HEAPF32[$9 >> 2] - HEAPF32[$11_1 >> 2]) - HEAPF32[$23_1 >> 2];
           }
           $16($13_1 + 136 | 0);
           continue;
          };
         }
         if (!(HEAPU8[$0_1 | 0] & 8 | ((HEAPU8[$0_1 + 21 | 0] | HEAPU8[$0_1 + 22 | 0] << 8) & 12288 | ($65_1 | 0) == 1))) {
          break block174
         }
         $96($0_1, $0_1, $27_1 >>> 0 > 1 ? $67_1 : $4_1, $16_1, $10_1, $65_1, $12_1, Math_fround(0.0), Math_fround(0.0), $20_1, $40_1);
        }
        $9 = HEAP32[$13_1 + 88 >> 2];
        if (!$9) {
         break block194
        }
        while (1) {
         $11_1 = HEAP32[$9 >> 2];
         $5($9);
         $9 = $11_1;
         if ($9) {
          continue
         }
         break;
        };
        break block194;
       }
       fimport$2();
       wasm2js_trap();
      }
      $64($0_1);
     }
     global$0 = $13_1 + 160 | 0;
     break block195;
    }
    $6();
    wasm2js_trap();
   }
   HEAP8[$0_1 + 168 | 0] = $3_1;
   HEAP32[$0_1 + 164 >> 2] = HEAP32[HEAP32[$0_1 + 500 >> 2] + 12 >> 2];
   if ($48_1) {
    break block10
   }
   $9 = HEAP32[$10_1 + 8 >> 2];
   $14_1 = HEAP32[$0_1 + 172 >> 2];
   $3_1 = $14_1 + 1 | 0;
   HEAP32[$10_1 + 8 >> 2] = $3_1 >>> 0 < $9 >>> 0 ? $9 : $3_1;
   if (($14_1 | 0) == 8) {
    HEAP32[$0_1 + 172 >> 2] = 0;
    $14_1 = 0;
   }
   if ($8_1) {
    $3_1 = $0_1 + 368 | 0
   } else {
    HEAP32[$0_1 + 172 >> 2] = $14_1 + 1;
    $3_1 = (Math_imul($14_1, 24) + $0_1 | 0) + 176 | 0;
   }
   HEAP32[$3_1 + 12 >> 2] = $5_1;
   HEAP32[$3_1 + 8 >> 2] = $4_1;
   HEAPF32[$3_1 + 4 >> 2] = $2_1;
   HEAPF32[$3_1 >> 2] = $1_1;
   HEAPF32[$3_1 + 16 >> 2] = HEAPF32[$0_1 + 404 >> 2];
   HEAPF32[$3_1 + 20 >> 2] = HEAPF32[$0_1 + 408 >> 2];
   $48_1 = 0;
  }
  if ($8_1) {
   $3_1 = HEAP32[$0_1 + 408 >> 2];
   HEAP32[$0_1 + 396 >> 2] = HEAP32[$0_1 + 404 >> 2];
   HEAP32[$0_1 + 400 >> 2] = $3_1;
   $4_1 = HEAPU8[$0_1 | 0];
   $3_1 = $4_1 | 1;
   HEAP8[$0_1 | 0] = $4_1 & 4 ? $3_1 & 251 : $3_1;
  }
  HEAP32[$0_1 + 160 >> 2] = $12_1;
  return !$48_1 | $75_1;
 }
 
 function $32($0_1, $1_1) {
  $0_1 = $0_1 | 0;
  $1_1 = $1_1 | 0;
  var $2_1 = 0;
  $2_1 = HEAP32[$0_1 >> 2];
  $0_1 = HEAP32[$0_1 + 4 >> 2];
  $1_1 = ($0_1 >> 1) + $1_1 | 0;
  if ($0_1 & 1) {
   $2_1 = HEAP32[$2_1 + HEAP32[$1_1 >> 2] >> 2]
  }
  return FUNCTION_TABLE[$2_1 | 0]($1_1) | 0;
 }
 
 function $33($0_1, $1_1, $2_1, $3_1, $4_1, $5_1, $6_1) {
  $0_1 = $0_1 + 20 | 0;
  $4_1 = Math_fround($15($0_1, $1_1, 257 >>> ($2_1 << 3) & 255, $3_1, $4_1) + Math_fround($4($0_1, $2_1, 1, $4_1) + $3($0_1, $2_1, 1, $4_1)));
  block2 : {
   block3 : {
    block1 : {
     switch (HEAP32[$5_1 >> 2]) {
     case 0:
     case 2:
      $3_1 = HEAPF32[$6_1 >> 2];
      $4_1 = $4_1 != $4_1 ? $3_1 : $3_1 < $4_1 ? $3_1 : $4_1;
      break block3;
     case 1:
      break block1;
     default:
      break block2;
     };
    }
    if ($4_1 != $4_1) {
     break block2
    }
    HEAP32[$5_1 >> 2] = 2;
   }
   HEAPF32[$6_1 >> 2] = $4_1;
  }
 }
 
 function $34($0_1) {
  var $1_1 = 0, $2_1 = Math_fround(0);
  if (!HEAP32[$0_1 + 484 >> 2]) {
   return Math_fround(0.0)
  }
  $1_1 = $0_1 + 124 | 0;
  $2_1 = $2($1_1, HEAPU16[$0_1 + 28 >> 1]);
  if ($2_1 == $2_1) {
   return $2($1_1, HEAPU16[$0_1 + 28 >> 1])
  }
  block : {
   if (HEAP8[HEAP32[$0_1 + 500 >> 2] + 8 | 0] & 1) {
    break block
   }
   $2_1 = $2($1_1, HEAPU16[$0_1 + 24 >> 1]);
   if ($2_1 != $2_1) {
    break block
   }
   if (!($2($1_1, HEAPU16[$0_1 + 24 >> 1]) < Math_fround(0.0))) {
    break block
   }
   return Math_fround(-$2($1_1, HEAPU16[$0_1 + 24 >> 1]));
  }
  return HEAP8[HEAP32[$0_1 + 500 >> 2] + 8 | 0] & 1 ? Math_fround(1.0) : Math_fround(0.0);
 }
 
 function $35($0_1, $1_1, $2_1, $3_1) {
  var $4_1 = 0, $5_1 = Math_fround(0);
  $4_1 = global$0 - 16 | 0;
  global$0 = $4_1;
  $10($4_1 + 8 | 0, $0_1, HEAP32[($1_1 << 2) + 4828 >> 2], $2_1);
  $5_1 = Math_fround(NaN);
  block2 : {
   block1 : {
    switch (HEAPU8[$4_1 + 12 | 0] - 1 | 0) {
    case 0:
     $5_1 = HEAPF32[$4_1 + 8 >> 2];
     break block2;
    case 1:
     break block1;
    default:
     break block2;
    };
   }
   $5_1 = Math_fround(Math_fround(HEAPF32[$4_1 + 8 >> 2] * $3_1) * Math_fround(.009999999776482582));
  }
  global$0 = $4_1 + 16 | 0;
  return $5_1 == $5_1 ? $5_1 : Math_fround(0.0);
 }
 
 function $36($0_1, $1_1, $2_1) {
  var $3_1 = 0;
  $3_1 = HEAPU8[$2_1 + 6 | 0] | HEAPU8[$2_1 + 7 | 0] << 8;
  if ($3_1 & 7) {
   $1($0_1, $1_1 + 104 | 0, $3_1);
   return;
  }
  $1_1 = $1_1 + 104 | 0;
  $3_1 = HEAPU8[$2_1 + 14 | 0] | HEAPU8[$2_1 + 15 | 0] << 8;
  if ($3_1 & 7) {
   $1($0_1, $1_1, $3_1);
   return;
  }
  $1($0_1, $1_1, HEAPU8[$2_1 + 16 | 0] | HEAPU8[$2_1 + 17 | 0] << 8);
 }
 
 function $37($0_1, $1_1, $2_1) {
  var $3_1 = 0;
  $3_1 = HEAPU8[$2_1 + 2 | 0] | HEAPU8[$2_1 + 3 | 0] << 8;
  if ($3_1 & 7) {
   $1($0_1, $1_1 + 104 | 0, $3_1);
   return;
  }
  $1_1 = $1_1 + 104 | 0;
  $3_1 = HEAPU8[$2_1 + 14 | 0] | HEAPU8[$2_1 + 15 | 0] << 8;
  if ($3_1 & 7) {
   $1($0_1, $1_1, $3_1);
   return;
  }
  $1($0_1, $1_1, HEAPU8[$2_1 + 16 | 0] | HEAPU8[$2_1 + 17 | 0] << 8);
 }
 
 function $38($0_1, $1_1, $2_1, $3_1) {
  block3 : {
   block2 : {
    block1 : {
     switch ($3_1 - 1 | 0) {
     case 0:
      $3_1 = HEAPU8[$2_1 + 10 | 0] | HEAPU8[$2_1 + 11 | 0] << 8;
      if (!($3_1 & 7)) {
       break block2
      }
      break block3;
     case 1:
      break block1;
     default:
      break block2;
     };
    }
    $3_1 = HEAPU8[$2_1 + 8 | 0] | HEAPU8[$2_1 + 9 | 0] << 8;
    if (!($3_1 & 7)) {
     break block2
    }
    break block3;
   }
   $3_1 = HEAPU8[$2_1 + 4 | 0] | HEAPU8[$2_1 + 5 | 0] << 8;
   if ($3_1 & 7) {
    break block3
   }
   $1_1 = $1_1 + 104 | 0;
   $3_1 = HEAPU8[$2_1 + 12 | 0] | HEAPU8[$2_1 + 13 | 0] << 8;
   if ($3_1 & 7) {
    $1($0_1, $1_1, $3_1);
    return;
   }
   $1($0_1, $1_1, HEAPU8[$2_1 + 16 | 0] | HEAPU8[$2_1 + 17 | 0] << 8);
   return;
  }
  $1($0_1, $1_1 + 104 | 0, $3_1);
 }
 
 function $39($0_1, $1_1, $2_1, $3_1) {
  block3 : {
   block2 : {
    block1 : {
     switch ($3_1 - 1 | 0) {
     case 0:
      $3_1 = HEAPU8[$2_1 + 8 | 0] | HEAPU8[$2_1 + 9 | 0] << 8;
      if (!($3_1 & 7)) {
       break block2
      }
      break block3;
     case 1:
      break block1;
     default:
      break block2;
     };
    }
    $3_1 = HEAPU8[$2_1 + 10 | 0] | HEAPU8[$2_1 + 11 | 0] << 8;
    if (!($3_1 & 7)) {
     break block2
    }
    break block3;
   }
   $3_1 = HEAPU8[$2_1 | 0] | HEAPU8[$2_1 + 1 | 0] << 8;
   if ($3_1 & 7) {
    break block3
   }
   $1_1 = $1_1 + 104 | 0;
   $3_1 = HEAPU8[$2_1 + 12 | 0] | HEAPU8[$2_1 + 13 | 0] << 8;
   if ($3_1 & 7) {
    $1($0_1, $1_1, $3_1);
    return;
   }
   $1($0_1, $1_1, HEAPU8[$2_1 + 16 | 0] | HEAPU8[$2_1 + 17 | 0] << 8);
   return;
  }
  $1($0_1, $1_1 + 104 | 0, $3_1);
 }
 
 function $40($0_1, $1_1, $2_1) {
  var $3_1 = 0, $4_1 = Math_fround(0), $5_1 = Math_fround(0), $6_1 = 0, $7_1 = 0;
  $3_1 = global$0 - 16 | 0;
  global$0 = $3_1;
  $6_1 = 1;
  $7_1 = $0_1 + 124 | 0;
  $1_1 = (($1_1 << 1) + $0_1 | 0) + 110 | 0;
  $1($3_1 + 8 | 0, $7_1, HEAPU16[$1_1 >> 1]);
  $4_1 = HEAPF32[$2_1 >> 2];
  $5_1 = HEAPF32[$3_1 + 8 >> 2];
  block1 : {
   block : {
    if ($4_1 != $5_1) {
     if ($5_1 == $5_1) {
      $2_1 = HEAPU8[$2_1 + 4 | 0];
      break block;
     }
     $6_1 = $4_1 != $4_1;
    }
    $2_1 = HEAPU8[$2_1 + 4 | 0];
    if (!$6_1) {
     break block
    }
    if (HEAPU8[$3_1 + 12 | 0] == ($2_1 & 255)) {
     break block1
    }
   }
   $27($7_1, $1_1, $4_1, $2_1);
   while (1) {
    $1_1 = HEAPU8[$0_1 | 0];
    if ($1_1 & 4) {
     break block1
    }
    HEAP8[$0_1 | 0] = $1_1 | 4;
    $1_1 = HEAP32[$0_1 + 16 >> 2];
    if ($1_1) {
     FUNCTION_TABLE[$1_1 | 0]($0_1)
    }
    HEAP32[$0_1 + 156 >> 2] = 2143289344;
    $0_1 = HEAP32[$0_1 + 484 >> 2];
    if ($0_1) {
     continue
    }
    break;
   };
  }
  global$0 = $3_1 + 16 | 0;
 }
 
 function $41($0_1, $1_1, $2_1) {
  var $3_1 = 0, $4_1 = 0, $5_1 = 0, wasm2js_i32$0 = 0, wasm2js_i32$1 = 0;
  block : {
   if (!$1_1) {
    $3_1 = $0_1;
    break block;
   }
   while (1) {
    $2_1 = $2_1 - 1 | 0;
    $3_1 = _ZN17compiler_builtins3int4udiv10divmod_u6417h6026910b5ed08e40E($0_1, $1_1, 10);
    $4_1 = i64toi32_i32$HIGH_BITS;
    (wasm2js_i32$0 = $2_1, wasm2js_i32$1 = __wasm_i64_mul($3_1, $4_1, 246, 0) + $0_1 | 48), HEAP8[wasm2js_i32$0 | 0] = wasm2js_i32$1;
    $5_1 = $1_1 >>> 0 > 9;
    $0_1 = $3_1;
    $1_1 = $4_1;
    if ($5_1) {
     continue
    }
    break;
   };
  }
  if ($3_1) {
   while (1) {
    $2_1 = $2_1 - 1 | 0;
    $0_1 = ($3_1 >>> 0) / 10 | 0;
    HEAP8[$2_1 | 0] = Math_imul($0_1, 246) + $3_1 | 48;
    $1_1 = $3_1 >>> 0 > 9;
    $3_1 = $0_1;
    if ($1_1) {
     continue
    }
    break;
   }
  }
  return $2_1;
 }
 
 function $42($0_1, $1_1) {
  var $2_1 = 0, $3_1 = 0;
  $2_1 = $0(4);
  HEAP32[$2_1 >> 2] = $1_1;
  $3_1 = $0(4);
  HEAP32[$3_1 >> 2] = $1_1;
  fimport$7(7617, $0_1 | 0, 7650, 5242, 191, $2_1 | 0, 7650, 5246, 192, $3_1 | 0);
 }
 
 function $43($0_1, $1_1, $2_1) {
  return $109($0_1, $1_1, $2_1, 1, 2);
 }
 
 function $44($0_1, $1_1, $2_1, $3_1) {
  var $4_1 = 0;
  HEAP32[$0_1 + 12 >> 2] = 0;
  HEAP32[$0_1 + 16 >> 2] = $3_1;
  block : {
   if ($1_1) {
    if ($1_1 >>> 0 >= 1073741824) {
     break block
    }
    $4_1 = $0($1_1 << 2);
   }
   HEAP32[$0_1 >> 2] = $4_1;
   $2_1 = ($2_1 << 2) + $4_1 | 0;
   HEAP32[$0_1 + 8 >> 2] = $2_1;
   HEAP32[$0_1 + 12 >> 2] = ($1_1 << 2) + $4_1;
   HEAP32[$0_1 + 4 >> 2] = $2_1;
   return $0_1;
  }
  $58();
  wasm2js_trap();
 }
 
 function $45($0_1, $1_1, $2_1) {
  var $3_1 = 0, $4_1 = Math_fround(0);
  $3_1 = global$0 - 16 | 0;
  global$0 = $3_1;
  $53($3_1 + 8 | 0, $0_1, HEAP32[($1_1 << 2) + 4828 >> 2], $2_1);
  $4_1 = Math_fround(NaN);
  block2 : {
   block1 : {
    switch (HEAPU8[$3_1 + 12 | 0] - 1 | 0) {
    case 0:
     $4_1 = HEAPF32[$3_1 + 8 >> 2];
     break block2;
    case 1:
     break block1;
    default:
     break block2;
    };
   }
   $4_1 = Math_fround(Math_fround(HEAPF32[$3_1 + 8 >> 2] * Math_fround(0.0)) * Math_fround(.009999999776482582));
  }
  global$0 = $3_1 + 16 | 0;
  return $4_1 == $4_1 ? Math_fround(Math_max($4_1, Math_fround(0.0))) : Math_fround(0.0);
 }
 
 function $46($0_1, $1_1, $2_1, $3_1) {
  var $4_1 = 0, $5_1 = 0, $6_1 = 0, $7_1 = 0, $8_1 = 0, $9 = 0, $10_1 = 0, $11_1 = 0, $12_1 = 0, $13_1 = 0, $14_1 = 0;
  $8_1 = global$0 - 16 | 0;
  global$0 = $8_1;
  $3_1 = (HEAPU8[$1_1 | 0] | HEAPU8[$1_1 + 1 | 0] << 8) & -8 | $3_1;
  HEAP8[$1_1 | 0] = $3_1;
  HEAP8[$1_1 + 1 | 0] = $3_1 >>> 8;
  block1 : {
   block4 : {
    block8 : {
     block12 : {
      block11 : {
       block7 : {
        block3 : {
         block10 : {
          block9 : {
           block : {
            if ($3_1 & 8) {
             $6_1 = $3_1 & 65535;
             $4_1 = $6_1 >>> 4 | 0;
             if ($6_1 >>> 0 <= 63) {
              $0_1 = (($4_1 << 2) + $0_1 | 0) + 4 | 0
             } else {
              $6_1 = HEAP32[$0_1 + 24 >> 2];
              $0_1 = HEAP32[$6_1 >> 2];
              $4_1 = $4_1 - 4 | 0;
              if ($4_1 >>> 0 >= HEAP32[$6_1 + 4 >> 2] - $0_1 >> 2 >>> 0) {
               break block
              }
              $0_1 = $0_1 + ($4_1 << 2) | 0;
             }
             HEAPF32[$0_1 >> 2] = $2_1;
             break block1;
            }
            $4_1 = Math_fround(Math_abs($2_1)) < Math_fround(2147483648.0) ? ~~$2_1 : -2147483648;
            if (!($4_1 + 2047 >>> 0 > 4094 | Math_fround($4_1 | 0) != $2_1)) {
             $3_1 = $3_1 & 15 | ($2_1 < Math_fround(0.0) ? 0 - $4_1 | 2048 : $4_1) << 4;
             break block1;
            }
            $11_1 = HEAPU16[$0_1 >> 1];
            HEAP16[$0_1 >> 1] = $11_1 + 1;
            if ($11_1 >>> 0 >= 4096) {
             break block3
            }
            if ($11_1 >>> 0 <= 3) {
             HEAPF32[(($11_1 << 2) + $0_1 | 0) + 4 >> 2] = $2_1;
             break block4;
            }
            $3_1 = HEAP32[$0_1 + 24 >> 2];
            if (!$3_1) {
             $3_1 = $0(24);
             HEAP32[$3_1 >> 2] = 0;
             HEAP32[$3_1 + 4 >> 2] = 0;
             HEAP32[$3_1 + 16 >> 2] = 0;
             HEAP32[$3_1 + 20 >> 2] = 0;
             HEAP32[$3_1 + 8 >> 2] = 0;
             HEAP32[$3_1 + 12 >> 2] = 0;
             HEAP32[$0_1 + 24 >> 2] = $3_1;
            }
            $4_1 = HEAP32[$3_1 + 4 >> 2];
            block5 : {
             if (($4_1 | 0) != HEAP32[$3_1 + 8 >> 2]) {
              HEAPF32[$4_1 >> 2] = $2_1;
              HEAP32[$3_1 + 4 >> 2] = $4_1 + 4;
              break block5;
             }
             $9 = HEAP32[$3_1 >> 2];
             $4_1 = $4_1 - $9 | 0;
             $7_1 = $4_1 >> 2;
             $6_1 = $7_1 + 1 | 0;
             if ($6_1 >>> 0 >= 1073741824) {
              break block
             }
             $5_1 = $4_1 >> 1;
             $6_1 = $4_1 >>> 0 >= 2147483644 ? 1073741823 : $5_1 >>> 0 > $6_1 >>> 0 ? $5_1 : $6_1;
             block6 : {
              if (!$6_1) {
               $5_1 = 0;
               $10_1 = $7_1;
               break block6;
              }
              if ($6_1 >>> 0 >= 1073741824) {
               break block7
              }
              $5_1 = $0($6_1 << 2);
              $9 = HEAP32[$3_1 >> 2];
              $4_1 = HEAP32[$3_1 + 4 >> 2] - $9 | 0;
              $10_1 = $4_1 >> 2;
             }
             $7_1 = ($7_1 << 2) + $5_1 | 0;
             HEAPF32[$7_1 >> 2] = $2_1;
             $9 = $21($7_1 - ($10_1 << 2) | 0, $9, $4_1);
             HEAP32[$3_1 + 8 >> 2] = ($6_1 << 2) + $5_1;
             HEAP32[$3_1 + 4 >> 2] = $7_1 + 4;
             $4_1 = HEAP32[$3_1 >> 2];
             HEAP32[$3_1 >> 2] = $9;
             if (!$4_1) {
              break block5
             }
             $5($4_1);
            }
            $6_1 = HEAP32[$0_1 + 24 >> 2];
            $3_1 = HEAP32[$6_1 + 16 >> 2];
            $0_1 = HEAP32[$6_1 + 20 >> 2];
            if (($3_1 | 0) != $0_1 << 5) {
             break block8
            }
            if (($3_1 + 1 | 0) < 0) {
             break block
            }
            if ($3_1 >>> 0 > 1073741822) {
             break block9
            }
            $0_1 = $0_1 << 6;
            $4_1 = ($3_1 & -32) + 32 | 0;
            $0_1 = $0_1 >>> 0 > $4_1 >>> 0 ? $0_1 : $4_1;
            if ($3_1 >>> 0 >= $0_1 >>> 0) {
             break block8
            }
            if (($0_1 | 0) >= 0) {
             break block10
            }
           }
           fimport$2();
           wasm2js_trap();
          }
          $0_1 = 2147483647;
          if ($3_1 >>> 0 >= 2147483647) {
           break block8
          }
         }
         HEAP32[$8_1 + 8 >> 2] = 0;
         HEAP32[$8_1 >> 2] = 0;
         HEAP32[$8_1 + 4 >> 2] = 0;
         $129($8_1, $0_1);
         $4_1 = HEAP32[$6_1 + 12 >> 2];
         $7_1 = HEAP32[$8_1 + 4 >> 2];
         $0_1 = HEAP32[$6_1 + 16 >> 2];
         $3_1 = ($7_1 + ($0_1 & 31) | 0) + ($0_1 & -32) | 0;
         HEAP32[$8_1 + 4 >> 2] = $3_1;
         if (!$7_1) {
          $5_1 = $3_1 - 1 | 0;
          break block11;
         }
         $5_1 = $3_1 - 1 | 0;
         if (($5_1 ^ $7_1 - 1) >>> 0 > 31) {
          break block11
         }
         $9 = HEAP32[$8_1 >> 2];
         break block12;
        }
        fimport$11(4757, 3041, 34, 3036);
        wasm2js_trap();
       }
       $58();
       wasm2js_trap();
      }
      $9 = HEAP32[$8_1 >> 2];
      HEAP32[$9 + (($3_1 >>> 0 >= 33 ? $5_1 >>> 5 | 0 : 0) << 2) >> 2] = 0;
     }
     $3_1 = ($7_1 >>> 3 & 536870908) + $9 | 0;
     $7_1 = $7_1 & 31;
     block13 : {
      if (!$7_1) {
       if (($0_1 | 0) <= 0) {
        break block13
       }
       $5_1 = ($0_1 | 0) / 32 | 0;
       if ($0_1 + 31 >>> 0 >= 63) {
        $21($3_1, $4_1, $5_1 << 2)
       }
       $0_1 = $0_1 - ($5_1 << 5) | 0;
       if (($0_1 | 0) <= 0) {
        break block13
       }
       $5_1 = $5_1 << 2;
       $3_1 = $3_1 + $5_1 | 0;
       $0_1 = -1 >>> 32 - $0_1 | 0;
       HEAP32[$3_1 >> 2] = HEAP32[$3_1 >> 2] & ($0_1 ^ -1) | $0_1 & HEAP32[$4_1 + $5_1 >> 2];
       break block13;
      }
      if (($0_1 | 0) <= 0) {
       break block13
      }
      $12_1 = -1 << $7_1;
      $10_1 = 32 - $7_1 | 0;
      if (($0_1 | 0) >= 32) {
       $14_1 = $12_1 ^ -1;
       $5_1 = HEAP32[$3_1 >> 2];
       while (1) {
        $13_1 = $5_1 & $14_1;
        $5_1 = HEAP32[$4_1 >> 2];
        HEAP32[$3_1 >> 2] = $13_1 | $5_1 << $7_1;
        $5_1 = HEAP32[$3_1 + 4 >> 2] & $12_1 | $5_1 >>> $10_1;
        HEAP32[$3_1 + 4 >> 2] = $5_1;
        $4_1 = $4_1 + 4 | 0;
        $3_1 = $3_1 + 4 | 0;
        $13_1 = $0_1 >>> 0 > 63;
        $0_1 = $0_1 - 32 | 0;
        if ($13_1) {
         continue
        }
        break;
       };
       if (($0_1 | 0) <= 0) {
        break block13
       }
      }
      $5_1 = ($0_1 | 0) > ($10_1 | 0) ? $10_1 : $0_1;
      $4_1 = HEAP32[$4_1 >> 2] & -1 >>> 32 - $0_1;
      HEAP32[$3_1 >> 2] = HEAP32[$3_1 >> 2] & (-1 >>> $10_1 - $5_1 & $12_1 ^ -1) | $4_1 << $7_1;
      $0_1 = $0_1 - $5_1 | 0;
      if (($0_1 | 0) <= 0) {
       break block13
      }
      $3_1 = ($5_1 + $7_1 >>> 3 & 536870908) + $3_1 | 0;
      HEAP32[$3_1 >> 2] = HEAP32[$3_1 >> 2] & (-1 >>> 32 - $0_1 ^ -1) | $4_1 >>> $5_1;
     }
     $0_1 = HEAP32[$6_1 + 12 >> 2];
     HEAP32[$6_1 + 12 >> 2] = $9;
     $3_1 = HEAP32[$8_1 + 4 >> 2];
     HEAP32[$6_1 + 16 >> 2] = $3_1;
     HEAP32[$6_1 + 20 >> 2] = HEAP32[$8_1 + 8 >> 2];
     if (!$0_1) {
      break block8
     }
     $5($0_1);
     $3_1 = HEAP32[$6_1 + 16 >> 2];
    }
    HEAP32[$6_1 + 16 >> 2] = $3_1 + 1;
    $0_1 = HEAP32[$6_1 + 12 >> 2] + ($3_1 >>> 3 & 536870908) | 0;
    $4_1 = HEAP32[$0_1 >> 2];
    $10_1 = $0_1;
    $0_1 = $3_1 & 31;
    $7_1 = (-1 >>> $0_1 & -2) << $0_1;
    $0_1 = 0 - $3_1 & 31;
    HEAP32[$10_1 >> 2] = $4_1 & ($7_1 | (-1 << $0_1 & -2) >>> $0_1);
    $3_1 = HEAPU8[$1_1 | 0] | HEAPU8[$1_1 + 1 | 0] << 8;
   }
   $3_1 = $3_1 & 7 | $11_1 << 4 | 8;
  }
  HEAP8[$1_1 | 0] = $3_1;
  HEAP8[$1_1 + 1 | 0] = $3_1 >>> 8;
  global$0 = $8_1 + 16 | 0;
 }
 
 function $47($0_1, $1_1, $2_1) {
  var $3_1 = 0, $4_1 = Math_fround(0);
  $3_1 = global$0 - 16 | 0;
  global$0 = $3_1;
  $1_1 = HEAPU16[(($1_1 & 254) == 2 ? 84 : 86) + $0_1 >> 1];
  $1($3_1 + 8 | 0, $0_1 + 104 | 0, $1_1 & 7 ? $1_1 : HEAPU16[$0_1 + 88 >> 1]);
  $4_1 = Math_fround(NaN);
  block2 : {
   block1 : {
    switch (HEAPU8[$3_1 + 12 | 0] - 1 | 0) {
    case 0:
     $4_1 = HEAPF32[$3_1 + 8 >> 2];
     break block2;
    case 1:
     break block1;
    default:
     break block2;
    };
   }
   $4_1 = Math_fround(Math_fround(HEAPF32[$3_1 + 8 >> 2] * $2_1) * Math_fround(.009999999776482582));
  }
  global$0 = $3_1 + 16 | 0;
  return $4_1 == $4_1 ? Math_fround(Math_max($4_1, Math_fround(0.0))) : Math_fround(0.0);
 }
 
 function $48($0_1) {
  var $1_1 = 0, $2_1 = 0, $3_1 = 0, $4_1 = 0, $5_1 = Math_fround(0), $6_1 = 0;
  $3_1 = global$0 - 32 | 0;
  global$0 = $3_1;
  $1_1 = HEAP32[$0_1 + 12 >> 2];
  block : {
   if ($1_1) {
    $5_1 = Math_fround(FUNCTION_TABLE[$1_1 | 0]($0_1, HEAPF32[$0_1 + 404 >> 2], HEAPF32[$0_1 + 408 >> 2]));
    if ($5_1 == $5_1) {
     break block
    }
    HEAP32[$3_1 >> 2] = 3882;
    $14($0_1, 5, 4824, $3_1);
    $6();
    wasm2js_trap();
   }
   $20($3_1 + 16 | 0, $0_1);
   $1_1 = HEAP32[$3_1 + 20 >> 2];
   $2_1 = HEAP32[$3_1 + 16 >> 2];
   block1 : {
    if (!($1_1 | $2_1)) {
     break block1
    }
    block2 : {
     while (1) {
      $6_1 = HEAP32[$2_1 + 492 >> 2];
      $2_1 = HEAP32[$2_1 + 488 >> 2];
      if ($6_1 - $2_1 >> 2 >>> 0 > $1_1 >>> 0) {
       $1_1 = HEAP32[$2_1 + ($1_1 << 2) >> 2];
       if (HEAP32[$1_1 + 476 >> 2]) {
        break block1
       }
       $2_1 = HEAPU8[$1_1 + 21 | 0] | HEAPU8[$1_1 + 22 | 0] << 8 | HEAPU8[$1_1 + 23 | 0] << 16;
       if (($2_1 & 12288) != 8192) {
        $2_1 = $2_1 >>> 8 & 15;
        if (!$2_1) {
         $2_1 = HEAPU8[$0_1 + 21 | 0] >>> 4 | 0
        }
        if (HEAPU8[$1_1 | 0] & 2 | (HEAPU8[$0_1 + 20 | 0] & 8 ? ($2_1 | 0) == 5 : 0)) {
         break block2
        }
        $4_1 = $4_1 ? $4_1 : $1_1;
       }
       $16($3_1 + 16 | 0);
       $1_1 = HEAP32[$3_1 + 20 >> 2];
       $2_1 = HEAP32[$3_1 + 16 >> 2];
       if ($1_1 | $2_1) {
        continue
       }
       break block1;
      }
      break;
     };
     fimport$2();
     wasm2js_trap();
    }
    $4_1 = $1_1;
   }
   $1_1 = HEAP32[$3_1 + 24 >> 2];
   if ($1_1) {
    while (1) {
     $2_1 = HEAP32[$1_1 >> 2];
     $5($1_1);
     $1_1 = $2_1;
     if ($1_1) {
      continue
     }
     break;
    }
   }
   if (!$4_1) {
    $5_1 = HEAPF32[$0_1 + 408 >> 2];
    break block;
   }
   $5_1 = Math_fround($48($4_1) + HEAPF32[$4_1 + 416 >> 2]);
  }
  global$0 = $3_1 + 32 | 0;
  return $5_1;
 }
 
 function $49($0_1) {
  var $1_1 = 0, $2_1 = 0, $3_1 = 0, $4_1 = 0, $5_1 = 0, $6_1 = 0, $7_1 = 0, $8_1 = 0;
  block1 : {
   $5_1 = HEAP32[$0_1 + 488 >> 2];
   $6_1 = HEAP32[$0_1 + 492 >> 2];
   if (($5_1 | 0) != ($6_1 | 0)) {
    while (1) {
     $3_1 = HEAP32[$5_1 >> 2];
     if (HEAP32[$3_1 + 484 >> 2] != ($0_1 | 0)) {
      $1_1 = HEAP32[HEAP32[$0_1 + 500 >> 2] >> 2];
      block : {
       if ($1_1) {
        $1_1 = FUNCTION_TABLE[$1_1 | 0]($3_1, $0_1, $7_1) | 0;
        if ($1_1) {
         break block
        }
       }
       $1_1 = $0(520);
       HEAP32[$1_1 + 16 >> 2] = HEAP32[$3_1 + 16 >> 2];
       $2_1 = HEAP32[$3_1 + 12 >> 2];
       HEAP32[$1_1 + 8 >> 2] = HEAP32[$3_1 + 8 >> 2];
       HEAP32[$1_1 + 12 >> 2] = $2_1;
       $2_1 = HEAP32[$3_1 + 4 >> 2];
       HEAP32[$1_1 >> 2] = HEAP32[$3_1 >> 2];
       HEAP32[$1_1 + 4 >> 2] = $2_1;
       $13($1_1 + 20 | 0, $3_1 + 20 | 0, 104);
       HEAP32[$1_1 + 128 >> 2] = 0;
       HEAP32[$1_1 + 132 >> 2] = 0;
       $2_1 = $1_1 + 124 | 0;
       HEAP16[$2_1 >> 1] = 0;
       HEAP32[$1_1 + 136 >> 2] = 0;
       HEAP32[$1_1 + 140 >> 2] = 0;
       HEAP32[$1_1 + 144 >> 2] = 0;
       HEAP32[$1_1 + 148 >> 2] = 0;
       $130($2_1, $3_1 + 124 | 0);
       $13($1_1 + 152 | 0, $3_1 + 152 | 0, 336);
       HEAP32[$1_1 + 496 >> 2] = 0;
       HEAP32[$1_1 + 488 >> 2] = 0;
       HEAP32[$1_1 + 492 >> 2] = 0;
       $2_1 = HEAP32[$3_1 + 492 >> 2];
       $4_1 = HEAP32[$3_1 + 488 >> 2];
       if (($2_1 | 0) != ($4_1 | 0)) {
        $4_1 = $2_1 - $4_1 | 0;
        if (($4_1 | 0) < 0) {
         break block1
        }
        $2_1 = $0($4_1);
        HEAP32[$1_1 + 492 >> 2] = $2_1;
        HEAP32[$1_1 + 488 >> 2] = $2_1;
        HEAP32[$1_1 + 496 >> 2] = $2_1 + $4_1;
        $4_1 = HEAP32[$3_1 + 488 >> 2];
        $8_1 = HEAP32[$3_1 + 492 >> 2];
        if (($4_1 | 0) != ($8_1 | 0)) {
         while (1) {
          HEAP32[$2_1 >> 2] = HEAP32[$4_1 >> 2];
          $2_1 = $2_1 + 4 | 0;
          $4_1 = $4_1 + 4 | 0;
          if (($8_1 | 0) != ($4_1 | 0)) {
           continue
          }
          break;
         }
        }
        HEAP32[$1_1 + 492 >> 2] = $2_1;
       }
       $2_1 = HEAP32[$3_1 + 504 >> 2];
       HEAP32[$1_1 + 500 >> 2] = HEAP32[$3_1 + 500 >> 2];
       HEAP32[$1_1 + 504 >> 2] = $2_1;
       HEAP32[$1_1 + 516 >> 2] = HEAP32[$3_1 + 516 >> 2];
       $2_1 = HEAP32[$3_1 + 512 >> 2];
       HEAP32[$1_1 + 508 >> 2] = HEAP32[$3_1 + 508 >> 2];
       HEAP32[$1_1 + 512 >> 2] = $2_1;
       HEAP32[$1_1 + 484 >> 2] = 0;
      }
      HEAP32[$5_1 >> 2] = $1_1;
      HEAP32[$1_1 + 484 >> 2] = $0_1;
     }
     $7_1 = $7_1 + 1 | 0;
     $5_1 = $5_1 + 4 | 0;
     if (($6_1 | 0) != ($5_1 | 0)) {
      continue
     }
     break;
    }
   }
   return;
  }
  fimport$2();
  wasm2js_trap();
 }
 
 function $50($0_1, $1_1, $2_1, $3_1) {
  block : {
   switch ($2_1 | 0) {
   case 1:
    $37($0_1, $1_1, $1_1 + 48 | 0);
    return;
   case 2:
    $38($0_1, $1_1, $1_1 + 48 | 0, $3_1);
    return;
   case 3:
    $36($0_1, $1_1, $1_1 + 48 | 0);
    return;
   default:
    $6();
    wasm2js_trap();
   case 0:
    break block;
   };
  }
  $39($0_1, $1_1, $1_1 + 48 | 0, $3_1);
 }
 
 function $51($0_1, $1_1, $2_1, $3_1) {
  var $4_1 = 0, $5_1 = Math_fround(0);
  $4_1 = global$0 - 16 | 0;
  global$0 = $4_1;
  $24($4_1 + 8 | 0, $0_1, HEAP32[($1_1 << 2) + 4828 >> 2], $2_1);
  $5_1 = Math_fround(NaN);
  block2 : {
   block1 : {
    switch (HEAPU8[$4_1 + 12 | 0] - 1 | 0) {
    case 0:
     $5_1 = HEAPF32[$4_1 + 8 >> 2];
     break block2;
    case 1:
     break block1;
    default:
     break block2;
    };
   }
   $5_1 = Math_fround(Math_fround(HEAPF32[$4_1 + 8 >> 2] * $3_1) * Math_fround(.009999999776482582));
  }
  global$0 = $4_1 + 16 | 0;
  return $5_1 == $5_1 ? $5_1 : Math_fround(0.0);
 }
 
 function $52($0_1, $1_1, $2_1) {
  var $3_1 = 0, $4_1 = Math_fround(0);
  $3_1 = global$0 - 16 | 0;
  global$0 = $3_1;
  $53($3_1 + 8 | 0, $0_1, HEAP32[($1_1 << 2) + 4844 >> 2], $2_1);
  $4_1 = Math_fround(NaN);
  block2 : {
   block1 : {
    switch (HEAPU8[$3_1 + 12 | 0] - 1 | 0) {
    case 0:
     $4_1 = HEAPF32[$3_1 + 8 >> 2];
     break block2;
    case 1:
     break block1;
    default:
     break block2;
    };
   }
   $4_1 = Math_fround(Math_fround(HEAPF32[$3_1 + 8 >> 2] * Math_fround(0.0)) * Math_fround(.009999999776482582));
  }
  global$0 = $3_1 + 16 | 0;
  return $4_1 == $4_1 ? Math_fround(Math_max($4_1, Math_fround(0.0))) : Math_fround(0.0);
 }
 
 function $53($0_1, $1_1, $2_1, $3_1) {
  block : {
   switch ($2_1 | 0) {
   case 1:
    $37($0_1, $1_1, $1_1 + 66 | 0);
    return;
   case 2:
    $38($0_1, $1_1, $1_1 + 66 | 0, $3_1);
    return;
   case 3:
    $36($0_1, $1_1, $1_1 + 66 | 0);
    return;
   default:
    $6();
    wasm2js_trap();
   case 0:
    break block;
   };
  }
  $39($0_1, $1_1, $1_1 + 66 | 0, $3_1);
 }
 
 function $54($0_1, $1_1, $2_1, $3_1) {
  $2_1 = !$2_1 << 1;
  return Math_fround(Math_fround($66($0_1, $2_1, $1_1, $3_1) + $45($0_1, $2_1, $1_1)) + Math_fround($97($0_1, $2_1, $1_1, $3_1) + $52($0_1, $2_1, $1_1)));
 }
 
 function $55($0_1, $1_1, $2_1) {
  var $3_1 = 0, $4_1 = Math_fround(0), $5_1 = Math_fround(0), $6_1 = 0, $7_1 = 0;
  $3_1 = global$0 - 16 | 0;
  global$0 = $3_1;
  $6_1 = 1;
  $7_1 = $0_1 + 124 | 0;
  $1_1 = (($1_1 << 1) + $0_1 | 0) + 118 | 0;
  $1($3_1 + 8 | 0, $7_1, HEAPU16[$1_1 >> 1]);
  $4_1 = HEAPF32[$2_1 >> 2];
  $5_1 = HEAPF32[$3_1 + 8 >> 2];
  block1 : {
   block : {
    if ($4_1 != $5_1) {
     if ($5_1 == $5_1) {
      $2_1 = HEAPU8[$2_1 + 4 | 0];
      break block;
     }
     $6_1 = $4_1 != $4_1;
    }
    $2_1 = HEAPU8[$2_1 + 4 | 0];
    if (!$6_1) {
     break block
    }
    if (HEAPU8[$3_1 + 12 | 0] == ($2_1 & 255)) {
     break block1
    }
   }
   $27($7_1, $1_1, $4_1, $2_1);
   while (1) {
    $1_1 = HEAPU8[$0_1 | 0];
    if ($1_1 & 4) {
     break block1
    }
    HEAP8[$0_1 | 0] = $1_1 | 4;
    $1_1 = HEAP32[$0_1 + 16 >> 2];
    if ($1_1) {
     FUNCTION_TABLE[$1_1 | 0]($0_1)
    }
    HEAP32[$0_1 + 156 >> 2] = 2143289344;
    $0_1 = HEAP32[$0_1 + 484 >> 2];
    if ($0_1) {
     continue
    }
    break;
   };
  }
  global$0 = $3_1 + 16 | 0;
 }
 
 function $56($0_1, $1_1, $2_1) {
  var $3_1 = 0, $4_1 = Math_fround(0), $5_1 = Math_fround(0), $6_1 = 0, $7_1 = 0;
  $3_1 = global$0 - 16 | 0;
  global$0 = $3_1;
  $6_1 = 1;
  $7_1 = $0_1 + 124 | 0;
  $1_1 = (($1_1 << 1) + $0_1 | 0) + 114 | 0;
  $1($3_1 + 8 | 0, $7_1, HEAPU16[$1_1 >> 1]);
  $4_1 = HEAPF32[$2_1 >> 2];
  $5_1 = HEAPF32[$3_1 + 8 >> 2];
  block1 : {
   block : {
    if ($4_1 != $5_1) {
     if ($5_1 == $5_1) {
      $2_1 = HEAPU8[$2_1 + 4 | 0];
      break block;
     }
     $6_1 = $4_1 != $4_1;
    }
    $2_1 = HEAPU8[$2_1 + 4 | 0];
    if (!$6_1) {
     break block
    }
    if (HEAPU8[$3_1 + 12 | 0] == ($2_1 & 255)) {
     break block1
    }
   }
   $27($7_1, $1_1, $4_1, $2_1);
   while (1) {
    $1_1 = HEAPU8[$0_1 | 0];
    if ($1_1 & 4) {
     break block1
    }
    HEAP8[$0_1 | 0] = $1_1 | 4;
    $1_1 = HEAP32[$0_1 + 16 >> 2];
    if ($1_1) {
     FUNCTION_TABLE[$1_1 | 0]($0_1)
    }
    HEAP32[$0_1 + 156 >> 2] = 2143289344;
    $0_1 = HEAP32[$0_1 + 484 >> 2];
    if ($0_1) {
     continue
    }
    break;
   };
  }
  global$0 = $3_1 + 16 | 0;
 }
 
 function $57($0_1) {
  return $0_1 - 48 >>> 0 < 10;
 }
 
 function $58() {
  fimport$2();
  wasm2js_trap();
 }
 
 function $59($0_1) {
  $0_1 = $0_1 | 0;
  return $0_1 | 0;
 }
 
 function $60($0_1) {
  $0_1 = $0_1 | 0;
  if ($0_1) {
   FUNCTION_TABLE[HEAP32[HEAP32[$0_1 >> 2] + 4 >> 2]]($0_1)
  }
 }
 
 function $61($0_1) {
  var $1_1 = 0;
  $1_1 = HEAP32[$0_1 + 12 >> 2];
  if ($1_1) {
   $5($1_1)
  }
  $1_1 = HEAP32[$0_1 >> 2];
  if ($1_1) {
   HEAP32[$0_1 + 4 >> 2] = $1_1;
   $5($1_1);
  }
  $5($0_1);
 }
 
 function $62($0_1, $1_1) {
  var $2_1 = 0, $3_1 = 0, $4_1 = 0;
  $3_1 = global$0 - 16 | 0;
  global$0 = $3_1;
  HEAP32[$0_1 + 4 >> 2] = 0;
  HEAP32[$0_1 + 8 >> 2] = 0;
  HEAP8[$0_1 + 21 | 0] = 65;
  HEAP8[$0_1 + 22 | 0] = 16;
  HEAP32[$0_1 + 12 >> 2] = 0;
  HEAP32[$0_1 + 16 >> 2] = 0;
  HEAP32[$0_1 + 24 >> 2] = 0;
  HEAP32[$0_1 + 28 >> 2] = 262144;
  HEAP8[$0_1 + 23 | 0] = HEAPU8[$0_1 + 23 | 0] & 224;
  HEAP8[$0_1 | 0] = HEAPU8[$0_1 | 0] & 224 | 5;
  HEAP8[$0_1 + 20 | 0] = HEAPU8[$0_1 + 20 | 0] & 128;
  $12($0_1 + 32 | 0, 0, 78);
  HEAP16[$0_1 + 114 >> 1] = 0;
  HEAP16[$0_1 + 116 >> 1] = 0;
  HEAP16[$0_1 + 118 >> 1] = 0;
  HEAP16[$0_1 + 120 >> 1] = 0;
  HEAP16[$0_1 + 110 >> 1] = 4;
  HEAP16[$0_1 + 112 >> 1] = 4;
  HEAP16[$0_1 + 122 >> 1] = 0;
  HEAP16[$0_1 + 124 >> 1] = 0;
  HEAP32[$0_1 + 128 >> 2] = 0;
  HEAP32[$0_1 + 132 >> 2] = 0;
  HEAP32[$0_1 + 136 >> 2] = 0;
  HEAP32[$0_1 + 140 >> 2] = 0;
  HEAP32[$0_1 + 144 >> 2] = 0;
  HEAP32[$0_1 + 148 >> 2] = 0;
  HEAP32[$0_1 + 160 >> 2] = 0;
  HEAP32[$0_1 + 164 >> 2] = 0;
  HEAP32[$0_1 + 152 >> 2] = 0;
  HEAP32[$0_1 + 156 >> 2] = 2143289344;
  HEAP8[$0_1 + 168 | 0] = 0;
  $12($0_1 + 172 | 0, 0, 196);
  $4_1 = $0_1 + 368 | 0;
  $2_1 = $0_1 + 176 | 0;
  while (1) {
   HEAP32[$2_1 + 16 >> 2] = -1082130432;
   HEAP32[$2_1 + 20 >> 2] = -1082130432;
   HEAP32[$2_1 + 8 >> 2] = 1;
   HEAP32[$2_1 + 12 >> 2] = 1;
   HEAP32[$2_1 >> 2] = -1082130432;
   HEAP32[$2_1 + 4 >> 2] = -1082130432;
   $2_1 = $2_1 + 24 | 0;
   if (($4_1 | 0) != ($2_1 | 0)) {
    continue
   }
   break;
  };
  HEAP32[$0_1 + 368 >> 2] = -1082130432;
  HEAP32[$0_1 + 372 >> 2] = -1082130432;
  HEAP32[$0_1 + 384 >> 2] = -1082130432;
  HEAP32[$0_1 + 388 >> 2] = -1082130432;
  HEAP32[$0_1 + 376 >> 2] = 1;
  HEAP32[$0_1 + 380 >> 2] = 1;
  HEAP32[$0_1 + 404 >> 2] = 2143289344;
  HEAP32[$0_1 + 408 >> 2] = 2143289344;
  HEAP32[$0_1 + 396 >> 2] = 2143289344;
  HEAP32[$0_1 + 400 >> 2] = 2143289344;
  $2_1 = $0_1 + 392 | 0;
  HEAP8[$2_1 | 0] = HEAPU8[$2_1 | 0] & 248;
  $12($0_1 + 412 | 0, 0, 88);
  HEAP8[$0_1 + 516 | 0] = 0;
  HEAP32[$0_1 + 512 >> 2] = 2143289344;
  HEAP8[$0_1 + 508 | 0] = 0;
  HEAP32[$0_1 + 504 >> 2] = 2143289344;
  HEAP32[$0_1 + 500 >> 2] = $1_1;
  if ($1_1) {
   if (HEAP8[$1_1 + 8 | 0] & 1) {
    HEAP8[$0_1 + 20 | 0] = HEAPU8[$0_1 + 20 | 0] & 243 | 8;
    $1_1 = (HEAPU8[$0_1 + 21 | 0] | HEAPU8[$0_1 + 22 | 0] << 8) & 65520 | 4;
    HEAP8[$0_1 + 21 | 0] = $1_1;
    HEAP8[$0_1 + 22 | 0] = $1_1 >>> 8;
   }
   global$0 = $3_1 + 16 | 0;
   return $0_1;
  }
  HEAP32[$3_1 >> 2] = 3362;
  $84($3_1);
  $6();
  wasm2js_trap();
 }
 
 function $63($0_1, $1_1, $2_1) {
  var $3_1 = Math_fround(0);
  $3_1 = HEAPF32[((HEAP32[($1_1 << 2) + 4860 >> 2] << 2) + $0_1 | 0) + 404 >> 2];
  $0_1 = $0_1 + 20 | 0;
  return Math_fround($3_1 + Math_fround($4($0_1, $1_1, 1, $2_1) + $3($0_1, $1_1, 1, $2_1)));
 }
 
 function $64($0_1) {
  var $1_1 = 0, $2_1 = 0, $3_1 = 0, $4_1 = 0, $5_1 = 0, $6_1 = 0, $7_1 = 0, $8_1 = 0, $9 = 0, $10_1 = 0;
  $1_1 = global$0 - 336 | 0;
  global$0 = $1_1;
  $3_1 = HEAP32[$0_1 + 488 >> 2];
  $5_1 = HEAP32[$0_1 + 492 >> 2];
  if (($3_1 | 0) != ($5_1 | 0)) {
   $7_1 = $1_1 + 268 | 0;
   $8_1 = $1_1 + 224 | 0;
   $9 = $1_1 + 32 | 0;
   $10_1 = $1_1 + 28 | 0;
   $4_1 = $1_1 + 16 | 0;
   while (1) {
    $2_1 = HEAP32[$3_1 >> 2];
    if ((HEAPU8[$2_1 + 23 | 0] << 16 & 786432) == 524288) {
     $12($1_1 + 8 | 0, 0, 324);
     HEAP32[$1_1 + 12 >> 2] = 2143289344;
     HEAP8[$4_1 + 8 | 0] = 0;
     HEAP32[$4_1 >> 2] = 0;
     HEAP32[$4_1 + 4 >> 2] = 0;
     $12($10_1, 0, 196);
     $0_1 = $9;
     while (1) {
      HEAP32[$0_1 + 16 >> 2] = -1082130432;
      HEAP32[$0_1 + 20 >> 2] = -1082130432;
      HEAP32[$0_1 + 8 >> 2] = 1;
      HEAP32[$0_1 + 12 >> 2] = 1;
      HEAP32[$0_1 >> 2] = -1082130432;
      HEAP32[$0_1 + 4 >> 2] = -1082130432;
      $0_1 = $0_1 + 24 | 0;
      if (($8_1 | 0) != ($0_1 | 0)) {
       continue
      }
      break;
     };
     HEAP32[$1_1 + 240 >> 2] = -1082130432;
     HEAP32[$1_1 + 244 >> 2] = -1082130432;
     HEAP32[$1_1 + 232 >> 2] = 1;
     HEAP32[$1_1 + 236 >> 2] = 1;
     HEAP32[$1_1 + 224 >> 2] = -1082130432;
     HEAP32[$1_1 + 228 >> 2] = -1082130432;
     HEAP32[$1_1 + 260 >> 2] = 2143289344;
     HEAP32[$1_1 + 264 >> 2] = 2143289344;
     HEAP32[$1_1 + 252 >> 2] = 2143289344;
     HEAP32[$1_1 + 256 >> 2] = 2143289344;
     HEAP8[$1_1 + 248 | 0] = HEAPU8[$1_1 + 248 | 0] & 248;
     $12($7_1, 0, 64);
     $13($2_1 + 152 | 0, $1_1 + 8 | 0, 324);
     HEAP32[$2_1 + 396 >> 2] = 0;
     HEAP32[$2_1 + 400 >> 2] = 0;
     $6_1 = HEAPU8[$2_1 | 0];
     $0_1 = $6_1 | 1;
     HEAP8[$2_1 | 0] = $6_1 & 4 ? $0_1 & 251 : $0_1;
     $49($2_1);
     $64($2_1);
    }
    $3_1 = $3_1 + 4 | 0;
    if (($5_1 | 0) != ($3_1 | 0)) {
     continue
    }
    break;
   };
  }
  global$0 = $1_1 + 336 | 0;
 }
 
 function $65($0_1) {
  var $1_1 = 0;
  $1_1 = 1;
  block : {
   if (HEAPU8[$0_1 + 30 | 0] & 7 | HEAPU8[$0_1 + 34 | 0] & 7 | (HEAPU8[$0_1 + 46 | 0] & 7 | HEAPU8[$0_1 + 42 | 0] & 7)) {
    break block
   }
   if (HEAPU8[$0_1 + 38 | 0] & 7) {
    break block
   }
   $1_1 = (HEAPU8[$0_1 + 40 | 0] & 7) != 0;
  }
  return $1_1;
 }
 
 function $66($0_1, $1_1, $2_1, $3_1) {
  var $4_1 = 0, $5_1 = Math_fround(0);
  $4_1 = global$0 - 16 | 0;
  global$0 = $4_1;
  $50($4_1 + 8 | 0, $0_1, HEAP32[($1_1 << 2) + 4828 >> 2], $2_1);
  $5_1 = Math_fround(NaN);
  block2 : {
   block1 : {
    switch (HEAPU8[$4_1 + 12 | 0] - 1 | 0) {
    case 0:
     $5_1 = HEAPF32[$4_1 + 8 >> 2];
     break block2;
    case 1:
     break block1;
    default:
     break block2;
    };
   }
   $5_1 = Math_fround(Math_fround(HEAPF32[$4_1 + 8 >> 2] * $3_1) * Math_fround(.009999999776482582));
  }
  global$0 = $4_1 + 16 | 0;
  return $5_1 == $5_1 ? Math_fround(Math_max($5_1, Math_fround(0.0))) : Math_fround(0.0);
 }
 
 function $67($0_1) {
  $0_1 = $0_1 | 0;
  var $1_1 = 0, $2_1 = 0, $3_1 = 0, $4_1 = 0, $5_1 = 0, $6_1 = 0, $7_1 = 0, $8_1 = 0, $9 = 0, $10_1 = 0, $11_1 = 0;
  $7_1 = 8;
  block6 : {
   if ($0_1 >>> 0 > 4294967239) {
    break block6
   }
   block5 : {
    while (1) {
     $7_1 = $7_1 >>> 0 <= 8 ? 8 : $7_1;
     $1_1 = HEAP32[1883];
     $5_1 = $1_1;
     $4_1 = HEAP32[1882];
     $0_1 = $0_1 >>> 0 <= 8 ? 8 : $0_1 + 3 & -4;
     block1 : {
      if ($0_1 >>> 0 <= 127) {
       $6_1 = ($0_1 >>> 3 | 0) - 1 | 0;
       break block1;
      }
      $3_1 = Math_clz32($0_1);
      $6_1 = (($0_1 >>> 29 - $3_1 ^ 4) - ($3_1 << 2) | 0) + 110 | 0;
      if ($0_1 >>> 0 <= 4095) {
       break block1
      }
      $3_1 = (($0_1 >>> 30 - $3_1 ^ 2) - ($3_1 << 1) | 0) + 71 | 0;
      $6_1 = $3_1 >>> 0 >= 63 ? 63 : $3_1;
     }
     $2_1 = $6_1 & 31;
     if (($6_1 & 63) >>> 0 >= 32) {
      $3_1 = 0;
      $1_1 = $1_1 >>> $2_1 | 0;
     } else {
      $3_1 = $1_1 >>> $2_1 | 0;
      $1_1 = ((1 << $2_1) - 1 & $1_1) << 32 - $2_1 | $4_1 >>> $2_1;
     }
     if ($1_1 | $3_1) {
      while (1) {
       $4_1 = $3_1;
       __inlined_func$__wasm_ctz_i64$18 : {
        if ($1_1 | $3_1) {
         $2_1 = $3_1 - 1 | 0;
         $8_1 = $2_1 + 1 | 0;
         $5_1 = $2_1;
         $2_1 = $1_1 - 1 | 0;
         $5_1 = ($2_1 | 0) != -1 ? $8_1 : $5_1;
         $3_1 = Math_clz32($3_1 ^ $5_1);
         $3_1 = ($3_1 | 0) == 32 ? Math_clz32($1_1 ^ $2_1) + 32 | 0 : $3_1;
         $2_1 = 63 - $3_1 | 0;
         i64toi32_i32$HIGH_BITS = 0 - ($3_1 >>> 0 > 63) | 0;
         break __inlined_func$__wasm_ctz_i64$18;
        }
        i64toi32_i32$HIGH_BITS = 0;
        $2_1 = 64;
       }
       $5_1 = $2_1;
       $2_1 = $5_1 & 31;
       if (($5_1 & 63) >>> 0 >= 32) {
        $3_1 = 0;
        $1_1 = $4_1 >>> $2_1 | 0;
       } else {
        $3_1 = $4_1 >>> $2_1 | 0;
        $1_1 = ((1 << $2_1) - 1 & $4_1) << 32 - $2_1 | $1_1 >>> $2_1;
       }
       $8_1 = $1_1;
       $6_1 = $5_1 + $6_1 | 0;
       $2_1 = $6_1 << 4;
       $1_1 = HEAP32[$2_1 + 6504 >> 2];
       $5_1 = $2_1 + 6496 | 0;
       block2 : {
        if (($1_1 | 0) != ($5_1 | 0)) {
         $4_1 = $69($1_1, $7_1, $0_1);
         if ($4_1) {
          break block6
         }
         $4_1 = HEAP32[$1_1 + 4 >> 2];
         HEAP32[$4_1 + 8 >> 2] = HEAP32[$1_1 + 8 >> 2];
         HEAP32[HEAP32[$1_1 + 8 >> 2] + 4 >> 2] = $4_1;
         HEAP32[$1_1 + 8 >> 2] = $5_1;
         $4_1 = $2_1 + 6500 | 0;
         HEAP32[$1_1 + 4 >> 2] = HEAP32[$4_1 >> 2];
         HEAP32[$4_1 >> 2] = $1_1;
         HEAP32[HEAP32[$1_1 + 4 >> 2] + 8 >> 2] = $1_1;
         $6_1 = $6_1 + 1 | 0;
         $1_1 = ($3_1 & 1) << 31 | $8_1 >>> 1;
         $3_1 = $3_1 >>> 1 | 0;
         break block2;
        }
        $9 = HEAP32[1883];
        $5_1 = $6_1 & 63;
        $1_1 = $5_1;
        $4_1 = $1_1 & 31;
        if ($1_1 >>> 0 >= 32) {
         $1_1 = 0;
         $2_1 = -1 >>> $4_1 | 0;
        } else {
         $1_1 = -1 >>> $4_1 | 0;
         $2_1 = $1_1 | (1 << $4_1) - 1 << 32 - $4_1;
        }
        $2_1 = $2_1 & -2;
        $4_1 = $5_1 & 31;
        if ($5_1 >>> 0 >= 32) {
         $1_1 = $2_1 << $4_1;
         $2_1 = 0;
        } else {
         $1_1 = (1 << $4_1) - 1 & $2_1 >>> 32 - $4_1 | $1_1 << $4_1;
         $2_1 = $2_1 << $4_1;
        }
        $10_1 = $2_1;
        $4_1 = $1_1;
        $5_1 = 0 - $6_1 & 63;
        $2_1 = $5_1;
        $1_1 = $2_1 & 31;
        if ($2_1 >>> 0 >= 32) {
         $1_1 = -1 << $1_1;
         $2_1 = 0;
        } else {
         $2_1 = -1 << $1_1;
         $1_1 = $2_1 | (1 << $1_1) - 1 & -1 >>> 32 - $1_1;
        }
        $11_1 = $2_1 & -2;
        $2_1 = $5_1 & 31;
        if ($5_1 >>> 0 >= 32) {
         $5_1 = 0;
         $1_1 = $1_1 >>> $2_1 | 0;
        } else {
         $5_1 = $1_1 >>> $2_1 | 0;
         $1_1 = ((1 << $2_1) - 1 & $1_1) << 32 - $2_1 | $11_1 >>> $2_1;
        }
        $1_1 = $1_1 | $10_1;
        i64toi32_i32$HIGH_BITS = $4_1 | $5_1;
        HEAP32[1882] = HEAP32[1882] & $1_1;
        HEAP32[1883] = i64toi32_i32$HIGH_BITS & $9;
        $1_1 = $8_1 ^ 1;
       }
       if ($1_1 | $3_1) {
        continue
       }
       break;
      };
      $5_1 = HEAP32[1883];
      $4_1 = HEAP32[1882];
     }
     block4 : {
      if ($4_1 | $5_1) {
       $3_1 = Math_clz32($5_1);
       $2_1 = 63 - (($3_1 | 0) == 32 ? Math_clz32($4_1) + 32 | 0 : $3_1) | 0;
       $1_1 = $2_1 << 4;
       $3_1 = HEAP32[$1_1 + 6504 >> 2];
       block3 : {
        if (!$5_1 & $4_1 >>> 0 < 1073741824) {
         break block3
        }
        $6_1 = 99;
        $1_1 = $1_1 + 6496 | 0;
        if (($1_1 | 0) == ($3_1 | 0)) {
         break block3
        }
        while (1) {
         if (!$6_1) {
          break block3
         }
         $4_1 = $69($3_1, $7_1, $0_1);
         if ($4_1) {
          break block6
         }
         $6_1 = $6_1 - 1 | 0;
         $3_1 = HEAP32[$3_1 + 8 >> 2];
         if (($1_1 | 0) != ($3_1 | 0)) {
          continue
         }
         break;
        };
        $3_1 = $1_1;
       }
       if ($70($0_1 + 48 | 0)) {
        break block4
       }
       if (!$3_1) {
        break block5
       }
       $6_1 = ($2_1 << 4) + 6496 | 0;
       if (($6_1 | 0) == ($3_1 | 0)) {
        break block5
       }
       while (1) {
        $4_1 = $69($3_1, $7_1, $0_1);
        if ($4_1) {
         break block6
        }
        $3_1 = HEAP32[$3_1 + 8 >> 2];
        if (($6_1 | 0) != ($3_1 | 0)) {
         continue
        }
        break;
       };
       break block5;
      }
      if (!$70($0_1 + 48 | 0)) {
       break block5
      }
     }
     $4_1 = 0;
     if ($7_1 - 1 & $7_1) {
      break block6
     }
     if ($0_1 >>> 0 <= 4294967239) {
      continue
     }
     break;
    };
    break block6;
   }
   $4_1 = 0;
  }
  return $4_1 | 0;
 }
 
 function $68($0_1, $1_1, $2_1, $3_1) {
  var $4_1 = 0, $5_1 = Math_fround(0);
  $4_1 = global$0 - 16 | 0;
  global$0 = $4_1;
  $10($4_1 + 8 | 0, $0_1, HEAP32[($1_1 << 2) + 4844 >> 2], $2_1);
  $5_1 = Math_fround(NaN);
  block2 : {
   block1 : {
    switch (HEAPU8[$4_1 + 12 | 0] - 1 | 0) {
    case 0:
     $5_1 = HEAPF32[$4_1 + 8 >> 2];
     break block2;
    case 1:
     break block1;
    default:
     break block2;
    };
   }
   $5_1 = Math_fround(Math_fround(HEAPF32[$4_1 + 8 >> 2] * $3_1) * Math_fround(.009999999776482582));
  }
  global$0 = $4_1 + 16 | 0;
  return $5_1 == $5_1 ? $5_1 : Math_fround(0.0);
 }
 
 function $69($0_1, $1_1, $2_1) {
  var $3_1 = 0, $4_1 = 0, $5_1 = 0, $6_1 = 0;
  $3_1 = $0_1 + 4 | 0;
  $4_1 = ($3_1 + $1_1 | 0) - 1 & 0 - $1_1;
  $1_1 = HEAP32[$0_1 >> 2];
  if ($4_1 + $2_1 >>> 0 <= ($1_1 + $0_1 | 0) - 4 >>> 0) {
   $5_1 = HEAP32[$0_1 + 4 >> 2];
   HEAP32[$5_1 + 8 >> 2] = HEAP32[$0_1 + 8 >> 2];
   HEAP32[HEAP32[$0_1 + 8 >> 2] + 4 >> 2] = $5_1;
   if (($3_1 | 0) != ($4_1 | 0)) {
    $4_1 = $4_1 - $3_1 | 0;
    $5_1 = $0_1 - (HEAP32[$0_1 - 4 >> 2] & -2) | 0;
    $3_1 = $4_1 + HEAP32[$5_1 >> 2] | 0;
    HEAP32[$5_1 >> 2] = $3_1;
    HEAP32[($5_1 + ($3_1 & -4) | 0) - 4 >> 2] = $3_1;
    $0_1 = $0_1 + $4_1 | 0;
    $1_1 = $1_1 - $4_1 | 0;
    HEAP32[$0_1 >> 2] = $1_1;
   }
   block1 : {
    if ($2_1 + 24 >>> 0 <= $1_1 >>> 0) {
     $3_1 = ($0_1 + $2_1 | 0) + 8 | 0;
     $1_1 = ($1_1 - $2_1 | 0) - 8 | 0;
     HEAP32[$3_1 >> 2] = $1_1;
     HEAP32[($3_1 + ($1_1 & -4) | 0) - 4 >> 2] = $1_1 | 1;
     $4_1 = HEAP32[$3_1 >> 2] - 8 | 0;
     block : {
      if ($4_1 >>> 0 <= 127) {
       $1_1 = ($4_1 >>> 3 | 0) - 1 | 0;
       break block;
      }
      $5_1 = Math_clz32($4_1);
      $1_1 = (($4_1 >>> 29 - $5_1 ^ 4) - ($5_1 << 2) | 0) + 110 | 0;
      if ($4_1 >>> 0 <= 4095) {
       break block
      }
      $1_1 = (($4_1 >>> 30 - $5_1 ^ 2) - ($5_1 << 1) | 0) + 71 | 0;
      $1_1 = $1_1 >>> 0 >= 63 ? 63 : $1_1;
     }
     $4_1 = $1_1 << 4;
     HEAP32[$3_1 + 4 >> 2] = $4_1 + 6496;
     $4_1 = $4_1 + 6504 | 0;
     HEAP32[$3_1 + 8 >> 2] = HEAP32[$4_1 >> 2];
     HEAP32[$4_1 >> 2] = $3_1;
     HEAP32[HEAP32[$3_1 + 8 >> 2] + 4 >> 2] = $3_1;
     $4_1 = HEAP32[1882];
     $5_1 = HEAP32[1883];
     $3_1 = $1_1 & 31;
     if (($1_1 & 63) >>> 0 >= 32) {
      $1_1 = 1 << $3_1;
      $3_1 = 0;
     } else {
      $6_1 = 1 << $3_1;
      $1_1 = $6_1 - 1 & 1 >>> 32 - $3_1;
      $3_1 = $6_1;
     }
     HEAP32[1882] = $3_1 | $4_1;
     HEAP32[1883] = $1_1 | $5_1;
     $1_1 = $2_1 + 8 | 0;
     HEAP32[$0_1 >> 2] = $1_1;
     HEAP32[(($1_1 & -4) + $0_1 | 0) - 4 >> 2] = $1_1;
     break block1;
    }
    HEAP32[($0_1 + $1_1 | 0) - 4 >> 2] = $1_1;
   }
   $0_1 = $0_1 + 4 | 0;
  } else {
   $0_1 = 0
  }
  return $0_1;
 }
 
 function $70($0_1) {
  var $1_1 = 0, $2_1 = 0, $3_1 = 0, $4_1 = 0, $5_1 = 0;
  $3_1 = HEAP32[1548];
  $1_1 = $0_1 + 7 & -8;
  $2_1 = $3_1 + $1_1 | 0;
  block1 : {
   block : {
    if ($2_1 >>> 0 <= $3_1 >>> 0 ? $1_1 : 0) {
     break block
    }
    if ($2_1 >>> 0 > __wasm_memory_size() << 16 >>> 0) {
     if (!(fimport$22($2_1 | 0) | 0)) {
      break block
     }
    }
    HEAP32[1548] = $2_1;
    break block1;
   }
   HEAP32[1919] = 48;
   $3_1 = -1;
  }
  if (($3_1 | 0) != -1) {
   $1_1 = $0_1 + $3_1 | 0;
   $2_1 = $1_1 - 16 | 0;
   HEAP32[$2_1 + 12 >> 2] = 16;
   HEAP32[$2_1 >> 2] = 16;
   $0_1 = HEAP32[1880];
   if ($0_1) {
    $5_1 = HEAP32[$0_1 + 8 >> 2]
   } else {
    $5_1 = 0
   }
   block3 : {
    block2 : {
     if (($5_1 | 0) == ($3_1 | 0)) {
      $4_1 = $3_1 - (HEAP32[$3_1 - 4 >> 2] & -2) | 0;
      $5_1 = HEAP32[$4_1 - 4 >> 2];
      HEAP32[$0_1 + 8 >> 2] = $1_1;
      $0_1 = $4_1 - ($5_1 & -2) | 0;
      $1_1 = -16;
      if (!(HEAP8[($0_1 + HEAP32[$0_1 >> 2] | 0) - 4 | 0] & 1)) {
       break block2
      }
      $1_1 = HEAP32[$0_1 + 4 >> 2];
      HEAP32[$1_1 + 8 >> 2] = HEAP32[$0_1 + 8 >> 2];
      HEAP32[HEAP32[$0_1 + 8 >> 2] + 4 >> 2] = $1_1;
      $2_1 = $2_1 - $0_1 | 0;
      HEAP32[$0_1 >> 2] = $2_1;
      break block3;
     }
     HEAP32[$3_1 + 12 >> 2] = 16;
     HEAP32[$3_1 >> 2] = 16;
     HEAP32[$3_1 + 8 >> 2] = $1_1;
     HEAP32[$3_1 + 4 >> 2] = $0_1;
     HEAP32[1880] = $3_1;
     $1_1 = 16;
    }
    $0_1 = $1_1 + $3_1 | 0;
    $2_1 = $2_1 - $0_1 | 0;
    HEAP32[$0_1 >> 2] = $2_1;
   }
   HEAP32[(($2_1 & -4) + $0_1 | 0) - 4 >> 2] = $2_1 | 1;
   $1_1 = HEAP32[$0_1 >> 2] - 8 | 0;
   block4 : {
    if ($1_1 >>> 0 <= 127) {
     $2_1 = ($1_1 >>> 3 | 0) - 1 | 0;
     break block4;
    }
    $4_1 = Math_clz32($1_1);
    $2_1 = (($1_1 >>> 29 - $4_1 ^ 4) - ($4_1 << 2) | 0) + 110 | 0;
    if ($1_1 >>> 0 <= 4095) {
     break block4
    }
    $2_1 = (($1_1 >>> 30 - $4_1 ^ 2) - ($4_1 << 1) | 0) + 71 | 0;
    $2_1 = $2_1 >>> 0 >= 63 ? 63 : $2_1;
   }
   $1_1 = $2_1 << 4;
   HEAP32[$0_1 + 4 >> 2] = $1_1 + 6496;
   $1_1 = $1_1 + 6504 | 0;
   HEAP32[$0_1 + 8 >> 2] = HEAP32[$1_1 >> 2];
   HEAP32[$1_1 >> 2] = $0_1;
   HEAP32[HEAP32[$0_1 + 8 >> 2] + 4 >> 2] = $0_1;
   $1_1 = HEAP32[1882];
   $4_1 = HEAP32[1883];
   $0_1 = $2_1 & 31;
   if (($2_1 & 63) >>> 0 >= 32) {
    $2_1 = 1 << $0_1;
    $5_1 = 0;
   } else {
    $5_1 = 1 << $0_1;
    $2_1 = $5_1 - 1 & 1 >>> 32 - $0_1;
   }
   HEAP32[1882] = $5_1 | $1_1;
   HEAP32[1883] = $2_1 | $4_1;
  }
  return ($3_1 | 0) != -1;
 }
 
 function $71($0_1, $1_1, $2_1) {
  var $3_1 = 0, $4_1 = Math_fround(0), $5_1 = Math_fround(0), $6_1 = 0, $7_1 = 0;
  $3_1 = global$0 - 16 | 0;
  global$0 = $3_1;
  $6_1 = 1;
  $7_1 = $0_1 + 124 | 0;
  $1_1 = (($1_1 << 1) + $0_1 | 0) + 32 | 0;
  $1($3_1 + 8 | 0, $7_1, HEAPU16[$1_1 >> 1]);
  $4_1 = HEAPF32[$2_1 >> 2];
  $5_1 = HEAPF32[$3_1 + 8 >> 2];
  block1 : {
   block : {
    if ($4_1 != $5_1) {
     if ($5_1 == $5_1) {
      $2_1 = HEAPU8[$2_1 + 4 | 0];
      break block;
     }
     $6_1 = $4_1 != $4_1;
    }
    $2_1 = HEAPU8[$2_1 + 4 | 0];
    if (!$6_1) {
     break block
    }
    if (HEAPU8[$3_1 + 12 | 0] == ($2_1 & 255)) {
     break block1
    }
   }
   $27($7_1, $1_1, $4_1, $2_1);
   while (1) {
    $1_1 = HEAPU8[$0_1 | 0];
    if ($1_1 & 4) {
     break block1
    }
    HEAP8[$0_1 | 0] = $1_1 | 4;
    $1_1 = HEAP32[$0_1 + 16 >> 2];
    if ($1_1) {
     FUNCTION_TABLE[$1_1 | 0]($0_1)
    }
    HEAP32[$0_1 + 156 >> 2] = 2143289344;
    $0_1 = HEAP32[$0_1 + 484 >> 2];
    if ($0_1) {
     continue
    }
    break;
   };
  }
  global$0 = $3_1 + 16 | 0;
 }
 
 function $72($0_1, $1_1) {
  var $2_1 = 0;
  block : {
   if (HEAP8[7596] & 1) {
    $2_1 = HEAP32[1898];
    break block;
   }
   $2_1 = fimport$12(1, 4992) | 0;
   HEAP8[7596] = 1;
   HEAP32[1898] = $2_1;
  }
  fimport$19($2_1 | 0, $0_1 | 0, $1_1 | 0, 0);
 }
 
 function $73($0_1, $1_1, $2_1) {
  var $3_1 = 0, $4_1 = Math_fround(0), $5_1 = Math_fround(0), $6_1 = 0, $7_1 = 0;
  $3_1 = global$0 - 16 | 0;
  global$0 = $3_1;
  $6_1 = 1;
  $7_1 = $0_1 + 124 | 0;
  $1_1 = (($1_1 << 1) + $0_1 | 0) + 50 | 0;
  $1($3_1 + 8 | 0, $7_1, HEAPU16[$1_1 >> 1]);
  $4_1 = HEAPF32[$2_1 >> 2];
  $5_1 = HEAPF32[$3_1 + 8 >> 2];
  block1 : {
   block : {
    if ($4_1 != $5_1) {
     if ($5_1 == $5_1) {
      $2_1 = HEAPU8[$2_1 + 4 | 0];
      break block;
     }
     $6_1 = $4_1 != $4_1;
    }
    $2_1 = HEAPU8[$2_1 + 4 | 0];
    if (!$6_1) {
     break block
    }
    if (HEAPU8[$3_1 + 12 | 0] == ($2_1 & 255)) {
     break block1
    }
   }
   $27($7_1, $1_1, $4_1, $2_1);
   while (1) {
    $1_1 = HEAPU8[$0_1 | 0];
    if ($1_1 & 4) {
     break block1
    }
    HEAP8[$0_1 | 0] = $1_1 | 4;
    $1_1 = HEAP32[$0_1 + 16 >> 2];
    if ($1_1) {
     FUNCTION_TABLE[$1_1 | 0]($0_1)
    }
    HEAP32[$0_1 + 156 >> 2] = 2143289344;
    $0_1 = HEAP32[$0_1 + 484 >> 2];
    if ($0_1) {
     continue
    }
    break;
   };
  }
  global$0 = $3_1 + 16 | 0;
 }
 
 function $74($0_1, $1_1, $2_1) {
  $0_1 = $0_1 | 0;
  $1_1 = $1_1 | 0;
  $2_1 = +$2_1;
  HEAPF64[HEAP32[$0_1 >> 2] + $1_1 >> 3] = $2_1;
 }
 
 function $75($0_1, $1_1) {
  $0_1 = $0_1 | 0;
  $1_1 = $1_1 | 0;
  return +HEAPF64[HEAP32[$0_1 >> 2] + $1_1 >> 3];
 }
 
 function $76($0_1) {
  $0_1 = $0_1 | 0;
  if ($0_1) {
   $5($0_1)
  }
 }
 
 function $77($0_1, $1_1) {
  var $2_1 = 0, $3_1 = Math_fround(0), $4_1 = Math_fround(0), $5_1 = 0, $6_1 = 0, $7_1 = 0;
  $2_1 = global$0 - 16 | 0;
  global$0 = $2_1;
  $5_1 = $0_1 + 124 | 0;
  $6_1 = $0_1 + 30 | 0;
  $1($2_1 + 8 | 0, $5_1, HEAPU16[$6_1 >> 1]);
  $7_1 = 1;
  $3_1 = HEAPF32[$1_1 >> 2];
  $4_1 = HEAPF32[$2_1 + 8 >> 2];
  block1 : {
   block : {
    if ($3_1 != $4_1) {
     if ($4_1 == $4_1) {
      $1_1 = HEAPU8[$1_1 + 4 | 0];
      break block;
     }
     $7_1 = $3_1 != $3_1;
    }
    $1_1 = HEAPU8[$1_1 + 4 | 0];
    if (!$7_1) {
     break block
    }
    if (HEAPU8[$2_1 + 12 | 0] == ($1_1 & 255)) {
     break block1
    }
   }
   $27($5_1, $6_1, $3_1, $1_1);
   while (1) {
    $1_1 = HEAPU8[$0_1 | 0];
    if ($1_1 & 4) {
     break block1
    }
    HEAP8[$0_1 | 0] = $1_1 | 4;
    $1_1 = HEAP32[$0_1 + 16 >> 2];
    if ($1_1) {
     FUNCTION_TABLE[$1_1 | 0]($0_1)
    }
    HEAP32[$0_1 + 156 >> 2] = 2143289344;
    $0_1 = HEAP32[$0_1 + 484 >> 2];
    if ($0_1) {
     continue
    }
    break;
   };
  }
  global$0 = $2_1 + 16 | 0;
 }
 
 function $78($0_1) {
  var $1_1 = 0, $2_1 = 0, $3_1 = 0, $4_1 = 0, $5_1 = 0, $6_1 = 0, $7_1 = 0, $8_1 = 0;
  wasm2js_scratch_store_f64(+$0_1);
  $6_1 = wasm2js_scratch_load_i32(1) | 0;
  $5_1 = wasm2js_scratch_load_i32(0) | 0;
  $4_1 = $6_1 >>> 20 & 2047;
  if (($4_1 | 0) == 2047) {
   $0_1 = $0_1 * 1.0;
   return $0_1 / $0_1;
  }
  $3_1 = $6_1 << 1 | $5_1 >>> 31;
  $2_1 = ($3_1 | 0) == 2145386496;
  $1_1 = $5_1 << 1;
  if ($2_1 & !$1_1 | $3_1 >>> 0 < 2145386496) {
   return $2_1 & !$1_1 ? $0_1 * 0.0 : $0_1
  }
  block : {
   if (!$4_1) {
    $4_1 = 0;
    $2_1 = $5_1 << 12;
    $3_1 = $6_1 << 12 | $5_1 >>> 20;
    $1_1 = $3_1;
    if (($1_1 | 0) >= 0 | ($1_1 | 0) > 0) {
     while (1) {
      $4_1 = $4_1 - 1 | 0;
      $3_1 = $1_1 << 1 | $2_1 >>> 31;
      $2_1 = $2_1 << 1;
      $1_1 = $3_1;
      if (($1_1 | 0) > 0 | ($1_1 | 0) >= 0) {
       continue
      }
      break;
     }
    }
    $7_1 = $5_1;
    $2_1 = 1 - $4_1 | 0;
    $1_1 = $2_1 & 31;
    if (($2_1 & 63) >>> 0 >= 32) {
     $3_1 = $5_1 << $1_1;
     $2_1 = 0;
    } else {
     $3_1 = (1 << $1_1) - 1 & $7_1 >>> 32 - $1_1 | $6_1 << $1_1;
     $2_1 = $7_1 << $1_1;
    }
    break block;
   }
   $2_1 = $5_1;
   $3_1 = $6_1 & 1048575 | 1048576;
  }
  $1_1 = $3_1;
  if (($4_1 | 0) > 1023) {
   while (1) {
    block1 : {
     $3_1 = $1_1 + -1048576 | 0;
     if (($3_1 | 0) < 0) {
      break block1
     }
     $1_1 = $3_1;
     if ($1_1 | $2_1) {
      break block1
     }
     return $0_1 * 0.0;
    }
    $1_1 = $1_1 << 1 | $2_1 >>> 31;
    $2_1 = $2_1 << 1;
    $4_1 = $4_1 - 1 | 0;
    if (($4_1 | 0) > 1023) {
     continue
    }
    break;
   };
   $4_1 = 1023;
  }
  block2 : {
   $3_1 = $1_1 + -1048576 | 0;
   if (($3_1 | 0) < 0) {
    break block2
   }
   $1_1 = $3_1;
   if ($1_1 | $2_1) {
    break block2
   }
   return $0_1 * 0.0;
  }
  if (($1_1 | 0) == 1048575 | $1_1 >>> 0 < 1048575) {
   while (1) {
    $4_1 = $4_1 - 1 | 0;
    $5_1 = $1_1 >>> 0 < 524288;
    $3_1 = $1_1 << 1 | $2_1 >>> 31;
    $2_1 = $2_1 << 1;
    $1_1 = $3_1;
    if ($5_1) {
     continue
    }
    break;
   }
  }
  $7_1 = $6_1 & -2147483648;
  $8_1 = $1_1 + -1048576 | $4_1 << 20;
  $5_1 = $2_1;
  $5_1 = $2_1;
  $6_1 = 1 - $4_1 | 0;
  $2_1 = $6_1 & 31;
  if (($6_1 & 63) >>> 0 >= 32) {
   $3_1 = 0;
   $2_1 = $1_1 >>> $2_1 | 0;
  } else {
   $3_1 = $1_1 >>> $2_1 | 0;
   $2_1 = ((1 << $2_1) - 1 & $1_1) << 32 - $2_1 | $5_1 >>> $2_1;
  }
  $1_1 = ($4_1 | 0) > 0;
  wasm2js_scratch_store_i32(0, ($1_1 ? $5_1 : $2_1) | 0);
  wasm2js_scratch_store_i32(1, ($1_1 ? $8_1 : $3_1) | $7_1);
  return +wasm2js_scratch_load_f64();
 }
 
 function $79() {
  var $0_1 = 0, $1_1 = 0, $2_1 = 0;
  while (1) {
   $1_1 = $0_1 << 4;
   $2_1 = $1_1 + 6496 | 0;
   HEAP32[$1_1 + 6500 >> 2] = $2_1;
   HEAP32[$1_1 + 6504 >> 2] = $2_1;
   $0_1 = $0_1 + 1 | 0;
   if (($0_1 | 0) != 64) {
    continue
   }
   break;
  };
  $70(48);
  HEAP32[1894] = 6;
  HEAP32[1895] = 0;
  $126();
  HEAP32[1895] = HEAP32[1906];
  HEAP32[1906] = 7576;
  HEAP32[1907] = 195;
  HEAP32[1908] = 0;
  $113();
  HEAP32[1908] = HEAP32[1906];
  HEAP32[1906] = 7628;
 }
 
 function $80($0_1, $1_1, $2_1, $3_1) {
  var $4_1 = 0, $5_1 = Math_fround(0), $6_1 = 0, $7_1 = 0;
  $4_1 = global$0 - 16 | 0;
  global$0 = $4_1;
  $5_1 = Math_fround(0.0);
  block : {
   if (!((HEAPU8[$0_1 + 21 | 0] | HEAPU8[$0_1 + 22 | 0] << 8) & 12288)) {
    break block
   }
   $6_1 = $4_1 + 8 | 0;
   $0_1 = $0_1 + 20 | 0;
   $7_1 = ($1_1 & 254) != 2 ? 1 : (($2_1 | 0) == 2) << 1;
   $24($6_1, $0_1, $7_1, $2_1);
   block1 : {
    if (!HEAPU8[$4_1 + 12 | 0]) {
     break block1
    }
    $24($6_1, $0_1, $7_1, $2_1);
    if (HEAPU8[$4_1 + 12 | 0] == 3) {
     break block1
    }
    $5_1 = $99($0_1, $1_1, $2_1, $3_1);
    break block;
   }
   $5_1 = Math_fround(-$98($0_1, $1_1, $2_1, $3_1));
  }
  $3_1 = $5_1;
  global$0 = $4_1 + 16 | 0;
  return $3_1;
 }
 
 function $81($0_1, $1_1) {
  var $2_1 = 0, $3_1 = 0;
  block1 : {
   block : {
    $2_1 = HEAP32[$0_1 + 488 >> 2];
    $3_1 = HEAP32[$0_1 + 492 >> 2];
    if (($2_1 | 0) == ($3_1 | 0)) {
     break block
    }
    while (1) {
     if (HEAP32[$2_1 >> 2] == ($1_1 | 0)) {
      break block
     }
     $2_1 = $2_1 + 4 | 0;
     if (($3_1 | 0) != ($2_1 | 0)) {
      continue
     }
     break;
    };
    break block1;
   }
   if (($2_1 | 0) == ($3_1 | 0)) {
    break block1
   }
   if ((HEAPU8[$1_1 + 23 | 0] << 16 & 786432) == 524288) {
    HEAP32[$0_1 + 480 >> 2] = HEAP32[$0_1 + 480 >> 2] - 1
   }
   $1_1 = $2_1 + 4 | 0;
   $21($2_1, $1_1, $3_1 - $1_1 | 0);
   HEAP32[$0_1 + 492 >> 2] = $3_1 - 4;
   return 1;
  }
  return 0;
 }
 
 function $82($0_1, $1_1) {
  return $43(6344, $0_1, $1_1);
 }
 
 function $83($0_1, $1_1, $2_1, $3_1, $4_1) {
  if (!$0_1) {
   if (!($2_1 ? ($2_1 | 0) != 5 : 0)) {
    $43(6200, $3_1, $4_1);
    return;
   }
   $82($3_1, $4_1);
   return;
  }
  FUNCTION_TABLE[HEAP32[$0_1 + 4 >> 2]]($0_1, $1_1, $2_1, $3_1, $4_1) | 0;
 }
 
 function $84($0_1) {
  var $1_1 = 0;
  $1_1 = global$0 - 16 | 0;
  global$0 = $1_1;
  HEAP32[$1_1 + 12 >> 2] = $0_1;
  $43(6200, 4824, $0_1);
  global$0 = $1_1 + 16 | 0;
 }
 
 function $85($0_1, $1_1, $2_1) {
  var $3_1 = 0, $4_1 = 0.0, $5_1 = 0, $6_1 = 0.0, $7_1 = 0.0, $8_1 = 0, $9 = Math_fround(0), $10_1 = 0.0, $11_1 = 0, $12_1 = Math_fround(0), $13_1 = 0.0, wasm2js_i32$0 = 0, wasm2js_f32$0 = Math_fround(0);
  $4_1 = +HEAPF32[$0_1 + 416 >> 2];
  $2_1 = $4_1 + $2_1;
  $6_1 = +HEAPF32[$0_1 + 412 >> 2];
  $7_1 = $6_1 + $1_1;
  $9 = HEAPF32[HEAP32[$0_1 + 500 >> 2] + 24 >> 2];
  if ($9 != Math_fround(0.0)) {
   $10_1 = +HEAPF32[$0_1 + 400 >> 2];
   $12_1 = HEAPF32[$0_1 + 396 >> 2];
   $1_1 = +$9;
   $3_1 = HEAPU8[$0_1 | 0] & 16;
   $5_1 = $3_1 >>> 4 | 0;
   (wasm2js_i32$0 = $0_1, wasm2js_f32$0 = $22($6_1, $1_1, 0, $5_1)), HEAPF32[wasm2js_i32$0 + 412 >> 2] = wasm2js_f32$0;
   (wasm2js_i32$0 = $0_1, wasm2js_f32$0 = $22($4_1, $1_1, 0, $5_1)), HEAPF32[wasm2js_i32$0 + 416 >> 2] = wasm2js_f32$0;
   $6_1 = +$12_1;
   $4_1 = $78($1_1 * $6_1);
   $5_1 = $4_1 != $4_1;
   if (!(!$5_1 & Math_abs($4_1) < .0001)) {
    $11_1 = $5_1 | !(Math_abs($4_1 + -1.0) < .0001)
   }
   $13_1 = $2_1 + $10_1;
   $6_1 = $7_1 + $6_1;
   $4_1 = $78($1_1 * $10_1);
   $5_1 = $4_1 != $4_1;
   block : {
    if (!$5_1) {
     $8_1 = 0;
     if (Math_abs($4_1) < .0001) {
      break block
     }
    }
    $8_1 = $5_1 | !(Math_abs($4_1 + -1.0) < .0001);
   }
   $5_1 = $8_1;
   $3_1 = ($3_1 | 0) != 0;
   (wasm2js_i32$0 = $0_1, wasm2js_f32$0 = Math_fround($22($6_1, $1_1, $3_1 & $11_1, $3_1 & ($11_1 ^ 1)) - $22($7_1, $1_1, 0, $3_1))), HEAPF32[wasm2js_i32$0 + 396 >> 2] = wasm2js_f32$0;
   (wasm2js_i32$0 = $0_1, wasm2js_f32$0 = Math_fround($22($13_1, $1_1, $3_1 & $5_1, $3_1 & ($5_1 ^ 1)) - $22($2_1, $1_1, 0, $3_1))), HEAPF32[wasm2js_i32$0 + 400 >> 2] = wasm2js_f32$0;
  }
  $3_1 = HEAP32[$0_1 + 488 >> 2];
  $0_1 = HEAP32[$0_1 + 492 >> 2];
  if (($3_1 | 0) != ($0_1 | 0)) {
   while (1) {
    $85(HEAP32[$3_1 >> 2], $7_1, $2_1);
    $3_1 = $3_1 + 4 | 0;
    if (($0_1 | 0) != ($3_1 | 0)) {
     continue
    }
    break;
   }
  }
 }
 
 function $86($0_1, $1_1, $2_1, $3_1, $4_1, $5_1) {
  var $6_1 = Math_fround(0);
  $0_1 = $0_1 + 20 | 0;
  $2_1 = $2_1 >>> 0 < 2;
  $6_1 = $23($0_1, $1_1, $2_1, $4_1, $5_1);
  $4_1 = $15($0_1, $1_1, $2_1, $4_1, $5_1);
  if (!($4_1 >= Math_fround(0.0) & $3_1 > $4_1)) {
   if (!($6_1 >= Math_fround(0.0))) {
    return $3_1
   }
   $4_1 = $3_1 < $6_1 ? $6_1 : $3_1;
  }
  return $4_1;
 }
 
 function $87($0_1, $1_1) {
  var $2_1 = 0;
  block : {
   $2_1 = HEAP32[$0_1 >> 2];
   if ($2_1) {
    while (1) {
     if (!$1_1) {
      break block
     }
     HEAP32[$2_1 + 4 >> 2] = HEAP32[$1_1 + 4 >> 2];
     HEAP32[$2_1 + 8 >> 2] = HEAP32[$1_1 + 8 >> 2];
     $1_1 = HEAP32[$1_1 >> 2];
     $0_1 = HEAP32[$0_1 >> 2];
     $2_1 = HEAP32[$2_1 >> 2];
     if ($2_1) {
      continue
     }
     break;
    }
   }
   $30($0_1, $1_1);
   return;
  }
  block1 : {
   if (!$0_1) {
    break block1
   }
   $1_1 = HEAP32[$0_1 >> 2];
   if (!$1_1) {
    break block1
   }
   HEAP32[$0_1 >> 2] = 0;
   while (1) {
    $0_1 = HEAP32[$1_1 >> 2];
    $5($1_1);
    $1_1 = $0_1;
    if ($1_1) {
     continue
    }
    break;
   };
  }
 }
 
 function $88($0_1, $1_1, $2_1, $3_1) {
  var $4_1 = 0, $5_1 = 0, $6_1 = 0, $7_1 = 0, $8_1 = 0, $9 = 0, $10_1 = 0, $11_1 = Math_fround(0), wasm2js_i32$0 = 0, wasm2js_f32$0 = Math_fround(0);
  $8_1 = $0_1 + 20 | 0;
  $4_1 = 3;
  $5_1 = HEAPU8[$0_1 + 20 | 0] >>> 2 & 3;
  $6_1 = HEAP32[$0_1 + 484 >> 2] ? $1_1 : 1;
  block : {
   block3 : {
    block2 : {
     if (($6_1 | 0) == 2) {
      block1 : {
       switch ($5_1 - 2 | 0) {
       case 0:
        break block;
       case 1:
        break block1;
       default:
        break block2;
       };
      }
      $4_1 = 2;
      break block;
     }
     $4_1 = 2;
     $7_1 = 0;
     if ($5_1 >>> 0 > 1) {
      break block3
     }
    }
    $7_1 = $4_1;
   }
   $4_1 = $5_1;
  }
  $9 = $4_1 >>> 0 < 2;
  $11_1 = $80($0_1, $4_1, $6_1, $9 ? $3_1 : $2_1);
  $3_1 = $80($0_1, $7_1, $6_1, $9 ? $2_1 : $3_1);
  $10_1 = $0_1 + 412 | 0;
  $6_1 = (($1_1 | 0) == 2) << 1;
  (wasm2js_i32$0 = $10_1 + (($9 ? 1 : $6_1) << 2) | 0, wasm2js_f32$0 = Math_fround($11_1 + $4($8_1, $4_1, $1_1, $2_1))), HEAPF32[wasm2js_i32$0 >> 2] = wasm2js_f32$0;
  $5_1 = (($1_1 | 0) != 2) << 1;
  (wasm2js_i32$0 = $10_1 + (($9 ? 3 : $5_1) << 2) | 0, wasm2js_f32$0 = Math_fround($11_1 + $3($8_1, $4_1, $1_1, $2_1))), HEAPF32[wasm2js_i32$0 >> 2] = wasm2js_f32$0;
  $0_1 = $7_1 >>> 1 | 0;
  (wasm2js_i32$0 = $10_1 + (($0_1 ? $6_1 : 1) << 2) | 0, wasm2js_f32$0 = Math_fround($3_1 + $4($8_1, $7_1, $1_1, $2_1))), HEAPF32[wasm2js_i32$0 >> 2] = wasm2js_f32$0;
  (wasm2js_i32$0 = $10_1 + (($0_1 ? $5_1 : 3) << 2) | 0, wasm2js_f32$0 = Math_fround($3_1 + $3($8_1, $7_1, $1_1, $2_1))), HEAPF32[wasm2js_i32$0 >> 2] = wasm2js_f32$0;
 }
 
 function $89($0_1) {
  var $1_1 = 0, $2_1 = 0, $3_1 = 0;
  $1_1 = global$0 - 336 | 0;
  global$0 = $1_1;
  $12($1_1 + 8 | 0, 0, 324);
  HEAP8[$1_1 + 24 | 0] = 0;
  HEAP32[$1_1 + 16 >> 2] = 0;
  HEAP32[$1_1 + 20 >> 2] = 0;
  HEAP32[$1_1 + 12 >> 2] = 2143289344;
  $12($1_1 + 28 | 0, 0, 196);
  $3_1 = $1_1 + 224 | 0;
  $2_1 = $1_1 + 32 | 0;
  while (1) {
   HEAP32[$2_1 + 16 >> 2] = -1082130432;
   HEAP32[$2_1 + 20 >> 2] = -1082130432;
   HEAP32[$2_1 + 8 >> 2] = 1;
   HEAP32[$2_1 + 12 >> 2] = 1;
   HEAP32[$2_1 >> 2] = -1082130432;
   HEAP32[$2_1 + 4 >> 2] = -1082130432;
   $2_1 = $2_1 + 24 | 0;
   if (($3_1 | 0) != ($2_1 | 0)) {
    continue
   }
   break;
  };
  HEAP32[$1_1 + 240 >> 2] = -1082130432;
  HEAP32[$1_1 + 244 >> 2] = -1082130432;
  HEAP32[$1_1 + 232 >> 2] = 1;
  HEAP32[$1_1 + 236 >> 2] = 1;
  HEAP32[$1_1 + 224 >> 2] = -1082130432;
  HEAP32[$1_1 + 228 >> 2] = -1082130432;
  HEAP32[$1_1 + 260 >> 2] = 2143289344;
  HEAP32[$1_1 + 264 >> 2] = 2143289344;
  HEAP32[$1_1 + 252 >> 2] = 2143289344;
  HEAP32[$1_1 + 256 >> 2] = 2143289344;
  HEAP8[$1_1 + 248 | 0] = HEAPU8[$1_1 + 248 | 0] & 248;
  $12($1_1 + 268 | 0, 0, 64);
  $13($0_1 + 152 | 0, $1_1 + 8 | 0, 324);
  HEAP32[$0_1 + 396 >> 2] = 0;
  HEAP32[$0_1 + 400 >> 2] = 0;
  HEAP8[$0_1 | 0] = HEAPU8[$0_1 | 0] | 1;
  $49($0_1);
  $2_1 = HEAP32[$0_1 + 488 >> 2];
  $0_1 = HEAP32[$0_1 + 492 >> 2];
  if (($2_1 | 0) != ($0_1 | 0)) {
   while (1) {
    $89(HEAP32[$2_1 >> 2]);
    $2_1 = $2_1 + 4 | 0;
    if (($0_1 | 0) != ($2_1 | 0)) {
     continue
    }
    break;
   }
  }
  global$0 = $1_1 + 336 | 0;
 }
 
 function $90($0_1) {
  var $1_1 = 0, $2_1 = 0, $3_1 = 0, $4_1 = 0, $5_1 = Math_fround(0), $6_1 = Math_fround(0), $7_1 = 0, $8_1 = 0, $9 = 0, $10_1 = 0, $11_1 = 0, $12_1 = 0;
  $1_1 = global$0 - 32 | 0;
  global$0 = $1_1;
  HEAP8[$1_1 + 30 | 0] = 0;
  HEAP8[$1_1 + 31 | 0] = 1;
  $9 = $0_1 + 110 | 0;
  $10_1 = $0_1 + 504 | 0;
  $11_1 = $0_1 + 114 | 0;
  $12_1 = $0_1 + 118 | 0;
  $3_1 = $0_1 + 124 | 0;
  $0_1 = 0;
  while (1) {
   $7_1 = HEAPU8[($1_1 + 30 | 0) + $4_1 | 0];
   $2_1 = $7_1 << 1;
   $4_1 = $2_1 + $12_1 | 0;
   $1($1_1 + 16 | 0, $3_1, HEAPU16[$4_1 >> 1]);
   block2 : {
    block : {
     if (!HEAPU8[$1_1 + 20 | 0]) {
      break block
     }
     $1($1_1 + 8 | 0, $3_1, HEAPU16[$4_1 >> 1]);
     $1($1_1, $3_1, HEAPU16[$2_1 + $11_1 >> 1]);
     if (HEAPU8[$1_1 + 12 | 0] != HEAPU8[$1_1 + 4 | 0]) {
      break block
     }
     $6_1 = HEAPF32[$1_1 + 8 >> 2];
     $8_1 = $6_1 != $6_1;
     $5_1 = HEAPF32[$1_1 >> 2];
     block1 : {
      if (!($8_1 | $5_1 != $5_1)) {
       if (Math_fround(Math_abs(Math_fround($6_1 - $5_1))) < Math_fround(9.999999747378752e-05)) {
        break block1
       }
       break block;
      }
      if (!$8_1 | $5_1 == $5_1) {
       break block
      }
     }
     $1($1_1 + 16 | 0, $3_1, HEAPU16[$4_1 >> 1]);
     break block2;
    }
    $1($1_1 + 16 | 0, $3_1, HEAPU16[$2_1 + $9 >> 1]);
   }
   $2_1 = ($7_1 << 3) + $10_1 | 0;
   HEAP8[$2_1 + 4 | 0] = HEAPU8[$1_1 + 20 | 0];
   HEAP32[$2_1 >> 2] = HEAP32[$1_1 + 16 >> 2];
   $4_1 = 1;
   $2_1 = $0_1;
   $0_1 = 1;
   if (!$2_1) {
    continue
   }
   break;
  };
  global$0 = $1_1 + 32 | 0;
 }
 
 function $91($0_1) {
  var $1_1 = 0;
  $1_1 = 0;
  block : {
   if (((HEAPU8[$0_1 + 21 | 0] | HEAPU8[$0_1 + 22 | 0] << 8) & 12288) == 8192) {
    break block
   }
   $1_1 = 1;
   if ($29($0_1) != Math_fround(0.0)) {
    break block
   }
   $1_1 = $34($0_1) != Math_fround(0.0);
  }
  return $1_1;
 }
 
 function $92($0_1, $1_1, $2_1, $3_1, $4_1, $5_1, $6_1) {
  var $7_1 = Math_fround(0);
  $3_1 = Math_fround($3_1 - $4_1);
  if ($3_1 == $3_1) {
   $0_1 = $0_1 + 20 | 0;
   $7_1 = $23($0_1, $1_1, $2_1, $5_1, $6_1);
   $7_1 = $7_1 != $7_1 ? Math_fround(0.0) : Math_fround($7_1 - $4_1);
   $5_1 = $15($0_1, $1_1, $2_1, $5_1, $6_1);
   $4_1 = $5_1 != $5_1 ? Math_fround(3402823466385288598117041.0e14) : Math_fround($5_1 - $4_1);
   $3_1 = $3_1 > $4_1 ? $4_1 : $3_1;
   $3_1 = $3_1 == $3_1 & $7_1 == $7_1 ? ($3_1 < $7_1 ? $7_1 : $3_1) : $3_1 != $3_1 ? $7_1 : $3_1;
  }
  return $3_1;
 }
 
 function $93($0_1, $1_1, $2_1, $3_1, $4_1, $5_1, $6_1, $7_1, $8_1, $9, $10_1, $11_1, $12_1) {
  var $13_1 = 0, $14_1 = Math_fround(0), $15_1 = Math_fround(0), $16_1 = 0, $17_1 = Math_fround(0), $18_1 = Math_fround(0), $19_1 = 0.0, $20_1 = Math_fround(0), $21_1 = 0, $22_1 = 0;
  if ($9 < Math_fround(0.0) | $8_1 < Math_fround(0.0)) {
   $0_1 = 0
  } else {
   $14_1 = $5_1;
   $18_1 = $1_1;
   $17_1 = $3_1;
   $15_1 = $7_1;
   $20_1 = HEAPF32[$12_1 + 24 >> 2];
   if ($20_1 != Math_fround(0.0)) {
    $19_1 = +$20_1;
    $18_1 = $22(+$1_1, $19_1, 0, 0);
    $17_1 = $22(+$17_1, $19_1, 0, 0);
    $14_1 = $22(+$14_1, $19_1, 0, 0);
    $15_1 = $22(+$15_1, $19_1, 0, 0);
   }
   $12_1 = 0;
   block : {
    if (($0_1 | 0) != ($4_1 | 0)) {
     break block
    }
    $13_1 = $18_1 != $18_1;
    $12_1 = Math_fround(Math_abs(Math_fround($14_1 - $18_1))) < Math_fround(9.999999747378752e-05);
    if (!($13_1 | $14_1 != $14_1)) {
     break block
    }
    $12_1 = 0;
    if ($14_1 == $14_1) {
     break block
    }
    $12_1 = $13_1;
   }
   block1 : {
    if (($2_1 | 0) != ($6_1 | 0)) {
     break block1
    }
    $13_1 = $17_1 != $17_1;
    if (!($13_1 | $15_1 != $15_1)) {
     $21_1 = Math_fround(Math_abs(Math_fround($15_1 - $17_1))) < Math_fround(9.999999747378752e-05);
     break block1;
    }
    if ($15_1 == $15_1) {
     break block1
    }
    $21_1 = $13_1;
   }
   $16_1 = 1;
   $13_1 = 1;
   block2 : {
    if ($12_1) {
     break block2
    }
    $1_1 = Math_fround($1_1 - $10_1);
    block3 : {
     if (!$0_1) {
      $0_1 = $1_1 != $1_1;
      if (!($0_1 | $8_1 != $8_1)) {
       $12_1 = 0;
       if (!(Math_fround(Math_abs(Math_fround($1_1 - $8_1))) < Math_fround(9.999999747378752e-05))) {
        break block3
       }
       break block2;
      }
      $12_1 = 0;
      if ($8_1 == $8_1) {
       break block3
      }
      if ($0_1) {
       break block2
      }
      break block3;
     }
     $12_1 = ($0_1 | 0) == 2;
     if (($0_1 | 0) != 2 | ($4_1 | 0) != 1) {
      break block3
     }
     if ($1_1 >= $8_1) {
      break block2
     }
     $0_1 = $8_1 != $8_1;
     block4 : {
      if (!($0_1 | $1_1 != $1_1)) {
       if (!(Math_fround(Math_abs(Math_fround($1_1 - $8_1))) < Math_fround(9.999999747378752e-05))) {
        break block4
       }
       break block2;
      }
      $13_1 = 0;
      if ($1_1 == $1_1) {
       break block2
      }
      $13_1 = 1;
      if ($0_1) {
       break block2
      }
     }
     $13_1 = 0;
     break block2;
    }
    $13_1 = 0;
    $0_1 = $8_1 != $8_1;
    if ($0_1 | !($1_1 < $5_1)) {
     break block2
    }
    $22_1 = !$12_1;
    $12_1 = $1_1 != $1_1;
    if ($22_1 | ($12_1 | $5_1 != $5_1 | ($4_1 | 0) != 2)) {
     break block2
    }
    $13_1 = 1;
    if ($1_1 >= $8_1) {
     break block2
    }
    $13_1 = 0;
    if ($0_1 | $12_1) {
     break block2
    }
    $13_1 = Math_fround(Math_abs(Math_fround($1_1 - $8_1))) < Math_fround(9.999999747378752e-05);
   }
   block5 : {
    if ($21_1) {
     break block5
    }
    $1_1 = Math_fround($3_1 - $11_1);
    block7 : {
     block6 : {
      if (!$2_1) {
       $2_1 = $1_1 != $1_1;
       if (!($2_1 | $9 != $9)) {
        $0_1 = 0;
        if (!(Math_fround(Math_abs(Math_fround($1_1 - $9))) < Math_fround(9.999999747378752e-05))) {
         break block6
        }
        break block5;
       }
       $0_1 = 0;
       if ($9 == $9) {
        break block6
       }
       if ($2_1) {
        break block5
       }
       break block6;
      }
      $0_1 = ($2_1 | 0) == 2;
      if (($2_1 | 0) != 2 | ($6_1 | 0) != 1) {
       break block6
      }
      if ($1_1 >= $9) {
       break block5
      }
      $0_1 = $9 != $9;
      if (!($0_1 | $1_1 != $1_1)) {
       if (!(Math_fround(Math_abs(Math_fround($1_1 - $9))) < Math_fround(9.999999747378752e-05))) {
        break block7
       }
       break block5;
      }
      $16_1 = 0;
      if ($1_1 == $1_1) {
       break block5
      }
      $16_1 = 1;
      if ($0_1) {
       break block5
      }
      break block7;
     }
     $2_1 = $9 != $9;
     if ($2_1 | !($1_1 < $7_1)) {
      break block7
     }
     $4_1 = !$0_1;
     $0_1 = $1_1 != $1_1;
     if ($4_1 | ($0_1 | $7_1 != $7_1 | ($6_1 | 0) != 2)) {
      break block7
     }
     if ($1_1 >= $9) {
      break block5
     }
     $16_1 = 0;
     if ($0_1 | $2_1) {
      break block5
     }
     $16_1 = Math_fround(Math_abs(Math_fround($1_1 - $9))) < Math_fround(9.999999747378752e-05);
     break block5;
    }
    $16_1 = 0;
   }
   $0_1 = $13_1 & $16_1;
  }
  return $0_1;
 }
 
 function $94($0_1) {
  var $1_1 = 0, $2_1 = 0, $3_1 = 0;
  $2_1 = global$0 - 16 | 0;
  global$0 = $2_1;
  block2 : {
   block : {
    if (!(HEAPU8[$0_1 + 20 | 0] & 8)) {
     break block
    }
    $3_1 = 1;
    if (((HEAPU8[$0_1 + 21 | 0] | HEAPU8[$0_1 + 22 | 0] << 8) & 240) == 80) {
     break block
    }
    $20($2_1, $0_1);
    $0_1 = HEAP32[$2_1 + 4 >> 2];
    $1_1 = HEAP32[$2_1 >> 2];
    block1 : {
     if (!$1_1) {
      $3_1 = 0;
      if (!$0_1) {
       break block1
      }
     }
     while (1) {
      $3_1 = HEAP32[$1_1 + 492 >> 2];
      $1_1 = HEAP32[$1_1 + 488 >> 2];
      if ($3_1 - $1_1 >> 2 >>> 0 <= $0_1 >>> 0) {
       break block2
      }
      $0_1 = HEAP32[$1_1 + ($0_1 << 2) >> 2];
      $0_1 = HEAPU8[$0_1 + 21 | 0] | HEAPU8[$0_1 + 22 | 0] << 8 | HEAPU8[$0_1 + 23 | 0] << 16;
      $3_1 = ($0_1 & 12288) != 8192 & ($0_1 & 3840) == 1280;
      if ($3_1) {
       break block1
      }
      $16($2_1);
      $0_1 = HEAP32[$2_1 + 4 >> 2];
      $1_1 = HEAP32[$2_1 >> 2];
      if ($0_1 | $1_1) {
       continue
      }
      break;
     };
    }
    $0_1 = HEAP32[$2_1 + 8 >> 2];
    if (!$0_1) {
     break block
    }
    while (1) {
     $1_1 = HEAP32[$0_1 >> 2];
     $5($0_1);
     $0_1 = $1_1;
     if ($0_1) {
      continue
     }
     break;
    };
   }
   global$0 = $2_1 + 16 | 0;
   return $3_1;
  }
  fimport$2();
  wasm2js_trap();
 }
 
 function $95($0_1) {
  var $1_1 = 0, $2_1 = 0, $3_1 = 0, $4_1 = 0;
  block : {
   $3_1 = HEAP32[$0_1 >> 2];
   $1_1 = HEAP32[$3_1 + 488 >> 2];
   block1 : {
    $4_1 = HEAP32[$0_1 + 4 >> 2];
    if ($4_1 >>> 0 < HEAP32[$3_1 + 492 >> 2] - $1_1 >> 2 >>> 0) {
     $2_1 = $1_1 + ($4_1 << 2) | 0;
     while (1) {
      $1_1 = HEAP32[$2_1 >> 2];
      if ((HEAPU8[$1_1 + 23 | 0] << 16 & 786432) != 524288) {
       break block
      }
      if (HEAP32[$1_1 + 492 >> 2] == HEAP32[$1_1 + 488 >> 2]) {
       break block1
      }
      $2_1 = $0(12);
      HEAP32[$2_1 + 4 >> 2] = $3_1;
      HEAP32[$2_1 + 8 >> 2] = $4_1;
      HEAP32[$2_1 >> 2] = HEAP32[$0_1 + 8 >> 2];
      $4_1 = 0;
      HEAP32[$0_1 + 4 >> 2] = 0;
      HEAP32[$0_1 >> 2] = $1_1;
      HEAP32[$0_1 + 8 >> 2] = $2_1;
      $3_1 = $1_1;
      $2_1 = HEAP32[$1_1 + 488 >> 2];
      if (($2_1 | 0) != HEAP32[$1_1 + 492 >> 2]) {
       continue
      }
      break;
     };
    }
    fimport$2();
    wasm2js_trap();
   }
   $16($0_1);
  }
 }
 
 function $96($0_1, $1_1, $2_1, $3_1, $4_1, $5_1, $6_1, $7_1, $8_1, $9, $10_1) {
  var $11_1 = 0, $12_1 = 0, $13_1 = 0, $14_1 = 0, $15_1 = Math_fround(0), $16_1 = 0, $17_1 = 0, $18_1 = 0, $19_1 = Math_fround(0), $20_1 = Math_fround(0), $21_1 = 0, $22_1 = Math_fround(0), $23_1 = 0, $24_1 = Math_fround(0), $25_1 = 0, $26_1 = Math_fround(0), $27_1 = Math_fround(0), $28_1 = 0, $29_1 = 0, $30_1 = 0;
  $18_1 = global$0 - 32 | 0;
  global$0 = $18_1;
  $20($18_1 + 8 | 0, $1_1);
  $12_1 = HEAP32[$18_1 + 12 >> 2];
  $13_1 = HEAP32[$18_1 + 8 >> 2];
  if ($12_1 | $13_1) {
   $29_1 = $3_1 ? $3_1 : 1;
   $25_1 = $0_1 + 20 | 0;
   $30_1 = $5_1 + 1 | 0;
   while (1) {
    block : {
     block20 : {
      block21 : {
       block16 : {
        block18 : {
         block19 : {
          block17 : {
           block14 : {
            $14_1 = HEAP32[$13_1 + 492 >> 2];
            $13_1 = HEAP32[$13_1 + 488 >> 2];
            if ($14_1 - $13_1 >> 2 >>> 0 > $12_1 >>> 0) {
             $11_1 = HEAP32[$13_1 + ($12_1 << 2) >> 2];
             $12_1 = HEAPU8[$11_1 + 21 | 0] | HEAPU8[$11_1 + 22 | 0] << 8 | HEAPU8[$11_1 + 23 | 0] << 16;
             if (($12_1 & 786432) == 262144) {
              break block
             }
             block1 : {
              switch ($12_1 >>> 12 & 3) {
              case 2:
               $15_1 = $9;
               $22_1 = $10_1;
               if (!(HEAPU8[HEAP32[$1_1 + 500 >> 2] + 20 | 0] & 4)) {
                $15_1 = Math_fround(HEAPF32[$0_1 + 404 >> 2] - Math_fround($18($25_1, 2, 1) + $17($25_1, 2, 1)));
                $22_1 = Math_fround(HEAPF32[$0_1 + 408 >> 2] - Math_fround($18($25_1, 0, 1) + $17($25_1, 0, 1)));
               }
               $17_1 = $11_1 + 20 | 0;
               $14_1 = HEAPU8[$1_1 + 20 | 0] >>> 2 & 3;
               $23_1 = ($3_1 | 0) != 2;
               block3 : {
                block6 : {
                 block5 : {
                  if (!$23_1) {
                   $13_1 = 0;
                   $12_1 = 3;
                   block4 : {
                    switch ($14_1 - 2 | 0) {
                    case 0:
                     break block3;
                    case 1:
                     break block4;
                    default:
                     break block5;
                    };
                   }
                   $12_1 = 2;
                   break block3;
                  }
                  $12_1 = 2;
                  $13_1 = 0;
                  if ($14_1 >>> 0 > 1) {
                   break block6
                  }
                 }
                 $13_1 = $12_1;
                }
                $12_1 = $14_1;
               }
               $27_1 = Math_fround($4($17_1, 2, 1, $15_1) + $3($17_1, 2, 1, $15_1));
               $26_1 = $4($17_1, 0, 1, $15_1);
               $24_1 = $3($17_1, 0, 1, $15_1);
               $20_1 = HEAPF32[$11_1 + 504 >> 2];
               block10 : {
                block9 : {
                 block7 : {
                  switch (HEAPU8[$11_1 + 508 | 0] - 1 | 0) {
                  case 1:
                   $20_1 = Math_fround(Math_fround($20_1 * $15_1) * Math_fround(.009999999776482582));
                   break;
                  case 0:
                   break block7;
                  default:
                   break block9;
                  };
                 }
                 if (!($20_1 >= Math_fround(0.0))) {
                  break block9
                 }
                 $20_1 = Math_fround($27_1 + $19($11_1, $3_1, 0, $15_1, $15_1));
                 break block10;
                }
                $16_1 = $18_1 + 24 | 0;
                $14_1 = $11_1 + 50 | 0;
                $39($16_1, $17_1, $14_1, $3_1);
                $20_1 = Math_fround(NaN);
                if (!HEAPU8[$18_1 + 28 | 0]) {
                 break block10
                }
                $38($16_1, $17_1, $14_1, $3_1);
                if (!HEAPU8[$18_1 + 28 | 0]) {
                 break block10
                }
                $39($16_1, $17_1, $14_1, $3_1);
                if (HEAPU8[$18_1 + 28 | 0] == 3) {
                 break block10
                }
                $38($16_1, $17_1, $14_1, $3_1);
                if (HEAPU8[$18_1 + 28 | 0] == 3) {
                 break block10
                }
                $20_1 = $7($11_1, 2, $3_1, Math_fround(Math_fround(HEAPF32[$0_1 + 404 >> 2] - Math_fround($45($25_1, 2, $3_1) + $52($25_1, 2, $3_1))) - Math_fround($51($17_1, 2, $3_1, $15_1) + $101($17_1, 2, $3_1, $15_1))), $15_1, $15_1);
               }
               $26_1 = Math_fround($26_1 + $24_1);
               $19_1 = HEAPF32[$11_1 + 512 >> 2];
               block13 : {
                block11 : {
                 switch (HEAPU8[$11_1 + 516 | 0] - 1 | 0) {
                 case 1:
                  $19_1 = Math_fround(Math_fround($19_1 * $22_1) * Math_fround(.009999999776482582));
                  break;
                 case 0:
                  break block11;
                 default:
                  break block13;
                 };
                }
                if (!($19_1 >= Math_fround(0.0))) {
                 break block13
                }
                $19_1 = Math_fround($26_1 + $19($11_1, $3_1, 1, $22_1, $15_1));
                break block14;
               }
               $16_1 = $18_1 + 24 | 0;
               $14_1 = $11_1 + 50 | 0;
               $37($16_1, $17_1, $14_1);
               block15 : {
                if (!HEAPU8[$18_1 + 28 | 0]) {
                 break block15
                }
                $36($16_1, $17_1, $14_1);
                if (!HEAPU8[$18_1 + 28 | 0]) {
                 break block15
                }
                $37($16_1, $17_1, $14_1);
                if (HEAPU8[$18_1 + 28 | 0] == 3) {
                 break block15
                }
                $36($16_1, $17_1, $14_1);
                if (HEAPU8[$18_1 + 28 | 0] == 3) {
                 break block15
                }
                $19_1 = $7($11_1, 0, $3_1, Math_fround(Math_fround(HEAPF32[$0_1 + 408 >> 2] - Math_fround($45($25_1, 0, $3_1) + $52($25_1, 0, $3_1))) - Math_fround($51($17_1, 0, $3_1, $22_1) + $101($17_1, 0, $3_1, $22_1))), $22_1, $15_1);
                break block14;
               }
               $19_1 = Math_fround(NaN);
               if ($20_1 != $20_1) {
                break block16
               }
               $14_1 = $11_1 + 124 | 0;
               $16_1 = $11_1 + 122 | 0;
               $24_1 = $2($14_1, HEAPU16[$16_1 >> 1]);
               if ($24_1 == $24_1) {
                break block17
               }
               break block18;
              case 0:
               break block1;
              default:
               break block;
              };
             }
             if (HEAPU8[$11_1 | 0] & 8) {
              break block
             }
             $49($11_1);
             $12_1 = HEAPU8[$11_1 + 20 | 0] & 3;
             $12_1 = $96($0_1, $11_1, $2_1, $12_1 ? $12_1 : $29_1, $4_1, $30_1, $6_1, Math_fround(HEAPF32[$11_1 + 412 >> 2] + $7_1), Math_fround(HEAPF32[$11_1 + 416 >> 2] + $8_1), $9, $10_1) | $21_1;
             $21_1 = 0;
             if (!($12_1 & 1)) {
              break block
             }
             $21_1 = 1;
             HEAP8[$11_1 | 0] = HEAPU8[$11_1 | 0] | 1;
             break block;
            }
            fimport$2();
            wasm2js_trap();
           }
           $28_1 = $20_1 != $20_1;
           if (($28_1 | 0) == ($19_1 != $19_1 | 0)) {
            break block19
           }
           $14_1 = $11_1 + 124 | 0;
           $16_1 = $11_1 + 122 | 0;
           $24_1 = $2($14_1, HEAPU16[$16_1 >> 1]);
           if ($24_1 != $24_1) {
            break block19
           }
           if ($28_1) {
            $20_1 = Math_fround(Math_fround(Math_fround($19_1 - $26_1) * $2($14_1, HEAPU16[$11_1 + 122 >> 1])) + $27_1);
            break block19;
           }
           if ($19_1 == $19_1) {
            break block19
           }
          }
          $19_1 = Math_fround($26_1 + Math_fround(Math_fround($20_1 - $27_1) / $2($14_1, HEAPU16[$16_1 >> 1])));
         }
         if ($20_1 != $20_1) {
          break block16
         }
         if ($19_1 == $19_1) {
          break block20
         }
        }
        $16_1 = 0;
        break block21;
       }
       $16_1 = 1;
      }
      $14_1 = $16_1 & (($2_1 | 0) != 1 & $12_1 >>> 0 < 2 & $15_1 > Math_fround(0.0));
      $31($11_1, $14_1 ? $15_1 : $20_1, $19_1, $3_1, $14_1 ? 2 : $16_1, $19_1 != $19_1, $15_1, $22_1, 0, 6, $4_1, $5_1, $6_1);
      $20_1 = Math_fround(HEAPF32[$11_1 + 404 >> 2] + Math_fround($4($17_1, 2, 1, $15_1) + $3($17_1, 2, 1, $15_1)));
      $19_1 = Math_fround(HEAPF32[$11_1 + 408 >> 2] + Math_fround($4($17_1, 0, 1, $15_1) + $3($17_1, 0, 1, $15_1)));
     }
     $14_1 = 1;
     $31($11_1, $20_1, $19_1, $3_1, 0, 0, $15_1, $22_1, 1, 1, $4_1, $5_1, $6_1);
     $100($0_1, $1_1, $11_1, $3_1, $12_1, 1, $15_1, $22_1);
     $100($0_1, $1_1, $11_1, $3_1, $13_1, 0, $15_1, $22_1);
     $14_1 = $21_1 & 1 ? $14_1 : HEAP8[$11_1 | 0] & 1;
     $16_1 = HEAPU8[$1_1 + 20 | 0];
     $12_1 = $16_1 >>> 2 & 3;
     block23 : {
      block41 : {
       block40 : {
        block39 : {
         block38 : {
          block34 : {
           block26 : {
            block29 : {
             block28 : {
              block27 : {
               block22 : {
                block25 : {
                 block24 : {
                  if (!$23_1) {
                   $21_1 = 0;
                   $13_1 = 3;
                   switch ($12_1 - 2 | 0) {
                   case 0:
                    break block22;
                   case 1:
                    break block23;
                   default:
                    break block24;
                   };
                  }
                  $13_1 = 2;
                  $21_1 = 0;
                  if ($12_1 >>> 0 > 1) {
                   break block25
                  }
                 }
                 $21_1 = $13_1;
                }
                if (!($16_1 & 4)) {
                 break block26
                }
                if (!($16_1 & 8)) {
                 break block27
                }
                $13_1 = $12_1;
               }
               $12_1 = $1_1;
               if ($65($17_1)) {
                break block28
               }
               break block29;
              }
              if (!(HEAPU8[$11_1 + 66 | 0] & 7 | (HEAPU8[$11_1 + 52 | 0] & 7 | HEAPU8[$11_1 + 56 | 0] & 7))) {
               $13_1 = $12_1;
               $12_1 = $1_1;
               if (!(HEAPU16[$11_1 - -64 >> 1] & 7)) {
                break block29
               }
               break block28;
              }
              $13_1 = $12_1;
             }
             $12_1 = $0_1;
            }
            block35 : {
             block33 : {
              switch ($13_1 - 1 | 0) {
              case 0:
               $13_1 = $11_1 + 408 | 0;
               $23_1 = $11_1 + 424 | 0;
               $16_1 = 1;
               $12_1 = $12_1 + 408 | 0;
               break block35;
              case 1:
               $13_1 = $11_1 + 404 | 0;
               $23_1 = $11_1 + 412 | 0;
               $16_1 = 2;
               $12_1 = $12_1 + 404 | 0;
               break block35;
              case 2:
               break block33;
              default:
               break block34;
              };
             }
             $13_1 = $11_1 + 404 | 0;
             $23_1 = $11_1 + 420 | 0;
             $16_1 = 0;
             $12_1 = $12_1 + 404 | 0;
            }
            HEAPF32[(($16_1 << 2) + $11_1 | 0) + 412 >> 2] = Math_fround(HEAPF32[$12_1 >> 2] - HEAPF32[$13_1 >> 2]) - HEAPF32[$23_1 >> 2];
           }
           if (!($21_1 & 1)) {
            break block23
           }
           block37 : {
            block36 : {
             if ($21_1 & 2) {
              $12_1 = $1_1;
              if ($65($17_1)) {
               break block36
              }
              break block37;
             }
             if (HEAPU8[$11_1 + 66 | 0] & 7 | (HEAPU8[$11_1 + 52 | 0] & 7 | HEAPU8[$11_1 + 56 | 0] & 7)) {
              break block36
             }
             $12_1 = $1_1;
             if (!(HEAPU16[$11_1 - -64 >> 1] & 7)) {
              break block37
             }
            }
            $12_1 = $0_1;
           }
           switch ($21_1 - 1 | 0) {
           case 0:
            break block38;
           case 1:
            break block39;
           case 2:
            break block40;
           default:
            break block34;
           };
          }
          $6();
          wasm2js_trap();
         }
         $21_1 = $11_1 + 408 | 0;
         $13_1 = $11_1 + 424 | 0;
         $23_1 = 1;
         $12_1 = $12_1 + 408 | 0;
         break block41;
        }
        $21_1 = $11_1 + 404 | 0;
        $13_1 = $11_1 + 412 | 0;
        $23_1 = 2;
        $12_1 = $12_1 + 404 | 0;
        break block41;
       }
       $21_1 = $11_1 + 404 | 0;
       $13_1 = $11_1 + 420 | 0;
       $23_1 = 0;
       $12_1 = $12_1 + 404 | 0;
      }
      HEAPF32[(($23_1 << 2) + $11_1 | 0) + 412 >> 2] = Math_fround(HEAPF32[$12_1 >> 2] - HEAPF32[$21_1 >> 2]) - HEAPF32[$13_1 >> 2];
     }
     $24_1 = HEAPF32[$11_1 + 416 >> 2];
     $15_1 = Math_fround(HEAPF32[$11_1 + 412 >> 2] - ($65($17_1) ? $7_1 : Math_fround(0.0)));
     block43 : {
      if (!(HEAPU8[$11_1 + 52 | 0] & 7 | HEAPU8[$11_1 + 56 | 0] & 7 | (HEAPU8[$11_1 + 66 | 0] & 7 | HEAPU16[$11_1 - -64 >> 1] & 7))) {
       $22_1 = Math_fround(0.0);
       break block43;
      }
      $22_1 = $8_1;
     }
     HEAPF32[$11_1 + 412 >> 2] = $15_1;
     HEAPF32[$11_1 + 416 >> 2] = $24_1 - $22_1;
     $21_1 = $14_1;
    }
    $16($18_1 + 8 | 0);
    $12_1 = HEAP32[$18_1 + 12 >> 2];
    $13_1 = HEAP32[$18_1 + 8 >> 2];
    if ($12_1 | $13_1) {
     continue
    }
    break;
   };
  }
  $12_1 = HEAP32[$18_1 + 16 >> 2];
  if ($12_1) {
   while (1) {
    $0_1 = HEAP32[$12_1 >> 2];
    $5($12_1);
    $12_1 = $0_1;
    if ($12_1) {
     continue
    }
    break;
   }
  }
  global$0 = $18_1 + 32 | 0;
  return $21_1 & 1;
 }
 
 function $97($0_1, $1_1, $2_1, $3_1) {
  var $4_1 = 0, $5_1 = Math_fround(0);
  $4_1 = global$0 - 16 | 0;
  global$0 = $4_1;
  $50($4_1 + 8 | 0, $0_1, HEAP32[($1_1 << 2) + 4844 >> 2], $2_1);
  $5_1 = Math_fround(NaN);
  block2 : {
   block1 : {
    switch (HEAPU8[$4_1 + 12 | 0] - 1 | 0) {
    case 0:
     $5_1 = HEAPF32[$4_1 + 8 >> 2];
     break block2;
    case 1:
     break block1;
    default:
     break block2;
    };
   }
   $5_1 = Math_fround(Math_fround(HEAPF32[$4_1 + 8 >> 2] * $3_1) * Math_fround(.009999999776482582));
  }
  global$0 = $4_1 + 16 | 0;
  return $5_1 == $5_1 ? Math_fround(Math_max($5_1, Math_fround(0.0))) : Math_fround(0.0);
 }
 
 function $98($0_1, $1_1, $2_1, $3_1) {
  var $4_1 = 0, $5_1 = Math_fround(0);
  $4_1 = global$0 - 16 | 0;
  global$0 = $4_1;
  $24($4_1 + 8 | 0, $0_1, ($1_1 & 254) != 2 ? 3 : (($2_1 | 0) != 2) << 1, $2_1);
  $5_1 = Math_fround(NaN);
  block2 : {
   block1 : {
    switch (HEAPU8[$4_1 + 12 | 0] - 1 | 0) {
    case 0:
     $5_1 = HEAPF32[$4_1 + 8 >> 2];
     break block2;
    case 1:
     break block1;
    default:
     break block2;
    };
   }
   $5_1 = Math_fround(Math_fround(HEAPF32[$4_1 + 8 >> 2] * $3_1) * Math_fround(.009999999776482582));
  }
  global$0 = $4_1 + 16 | 0;
  return $5_1 == $5_1 ? $5_1 : Math_fround(0.0);
 }
 
 function $99($0_1, $1_1, $2_1, $3_1) {
  var $4_1 = 0, $5_1 = Math_fround(0);
  $4_1 = global$0 - 16 | 0;
  global$0 = $4_1;
  $24($4_1 + 8 | 0, $0_1, ($1_1 & 254) != 2 ? 1 : (($2_1 | 0) == 2) << 1, $2_1);
  $5_1 = Math_fround(NaN);
  block2 : {
   block1 : {
    switch (HEAPU8[$4_1 + 12 | 0] - 1 | 0) {
    case 0:
     $5_1 = HEAPF32[$4_1 + 8 >> 2];
     break block2;
    case 1:
     break block1;
    default:
     break block2;
    };
   }
   $5_1 = Math_fround(Math_fround(HEAPF32[$4_1 + 8 >> 2] * $3_1) * Math_fround(.009999999776482582));
  }
  global$0 = $4_1 + 16 | 0;
  return $5_1 == $5_1 ? $5_1 : Math_fround(0.0);
 }
 
 function $100($0_1, $1_1, $2_1, $3_1, $4_1, $5_1, $6_1, $7_1) {
  var $8_1 = 0, $9 = 0, $10_1 = 0, $11_1 = 0, $12_1 = 0;
  $9 = global$0 - 16 | 0;
  global$0 = $9;
  $11_1 = $9 + 8 | 0;
  $8_1 = $2_1 + 20 | 0;
  $10_1 = ($4_1 & 254) == 2;
  $12_1 = $10_1 ? (($3_1 | 0) == 2) << 1 : 1;
  $24($11_1, $8_1, $12_1, $3_1);
  $7_1 = $10_1 ? $6_1 : $7_1;
  block10 : {
   block31 : {
    block49 : {
     block47 : {
      block5 : {
       block : {
        if (!HEAPU8[$9 + 12 | 0]) {
         break block
        }
        $24($11_1, $8_1, $12_1, $3_1);
        if (HEAPU8[$9 + 12 | 0] == 3) {
         break block
        }
        $6_1 = Math_fround(Math_fround($99($8_1, $4_1, $3_1, $7_1) + $18($0_1 + 20 | 0, $4_1, $3_1)) + $4($8_1, $4_1, $3_1, $7_1));
        $3_1 = 1;
        block6 : {
         block9 : {
          block2 : {
           block1 : {
            block3 : {
             switch ($4_1 | 0) {
             case 3:
              $3_1 = 2;
              break block1;
             case 0:
              break block1;
             case 1:
              break block2;
             case 2:
              break block3;
             default:
              break block5;
             };
            }
            $3_1 = 0;
           }
           if (($3_1 | 0) == ($12_1 | 0)) {
            break block6
           }
           block8 : {
            switch ($4_1 | 0) {
            case 2:
             $3_1 = $0_1 + 404 | 0;
             $0_1 = 0;
             break block9;
            case 0:
            case 1:
             break block2;
            case 3:
             break block8;
            default:
             break block5;
            };
           }
           $3_1 = $0_1 + 404 | 0;
           $0_1 = 0;
           break block9;
          }
          $3_1 = $0_1 + 408 | 0;
          $0_1 = 1;
         }
         $6_1 = Math_fround(Math_fround(HEAPF32[$3_1 >> 2] - HEAPF32[(($0_1 << 2) + $2_1 | 0) + 404 >> 2]) - $6_1);
        }
        HEAPF32[((HEAP32[($4_1 << 2) + 4828 >> 2] << 2) + $2_1 | 0) + 412 >> 2] = $6_1;
        break block10;
       }
       $11_1 = $9 + 8 | 0;
       $10_1 = $10_1 ? (($3_1 | 0) != 2) << 1 : 3;
       $24($11_1, $8_1, $10_1, $3_1);
       block11 : {
        if (!HEAPU8[$9 + 12 | 0]) {
         break block11
        }
        $24($11_1, $8_1, $10_1, $3_1);
        if (HEAPU8[$9 + 12 | 0] == 3) {
         break block11
        }
        block15 : {
         block12 : {
          switch ($4_1 | 0) {
          case 2:
           $5_1 = $0_1 + 404 | 0;
           $1_1 = 0;
           break block15;
          case 3:
           $5_1 = $0_1 + 404 | 0;
           $1_1 = 0;
           break block15;
          case 0:
          case 1:
           break block12;
          default:
           break block5;
          };
         }
         $5_1 = $0_1 + 408 | 0;
         $1_1 = 1;
        }
        $10_1 = $1_1 << 2;
        $1_1 = $2_1 + 404 | 0;
        $6_1 = Math_fround(Math_fround(Math_fround(Math_fround(HEAPF32[$5_1 >> 2] - HEAPF32[$10_1 + $1_1 >> 2]) - $17($0_1 + 20 | 0, $4_1, $3_1)) - $3($8_1, $4_1, $3_1, $7_1)) - $98($8_1, $4_1, $3_1, $7_1));
        $3_1 = 1;
        block20 : {
         block23 : {
          block17 : {
           block16 : {
            block18 : {
             switch ($4_1 | 0) {
             case 3:
              $3_1 = 2;
              break block16;
             case 0:
              break block16;
             case 1:
              break block17;
             case 2:
              break block18;
             default:
              break block5;
             };
            }
            $3_1 = 0;
           }
           if (($3_1 | 0) == ($12_1 | 0)) {
            break block20
           }
           block22 : {
            switch ($4_1 | 0) {
            case 2:
             $3_1 = $0_1 + 404 | 0;
             $0_1 = 0;
             break block23;
            case 0:
            case 1:
             break block17;
            case 3:
             break block22;
            default:
             break block5;
            };
           }
           $3_1 = $0_1 + 404 | 0;
           $0_1 = 0;
           break block23;
          }
          $3_1 = $0_1 + 408 | 0;
          $0_1 = 1;
         }
         $6_1 = Math_fround(Math_fround(HEAPF32[$3_1 >> 2] - HEAPF32[$1_1 + ($0_1 << 2) >> 2]) - $6_1);
        }
        HEAPF32[((HEAP32[($4_1 << 2) + 4828 >> 2] << 2) + $2_1 | 0) + 412 >> 2] = $6_1;
        break block10;
       }
       block32 : {
        block30 : {
         block24 : {
          if ($5_1) {
           $0_1 = HEAPU8[$1_1 + 20 | 0] >>> 4 & 7;
           if ($0_1 >>> 0 > 5) {
            break block10
           }
           $0_1 = 1 << $0_1;
           if ($0_1 & 50) {
            break block24
           }
           if ($0_1 & 9) {
            $0_1 = HEAP32[($4_1 << 2) + 4828 >> 2];
            $0_1 = $0_1 << 2;
            $1_1 = $0_1 + $1_1 | 0;
            $6_1 = Math_fround($35($8_1, $4_1, $3_1, $6_1) + HEAPF32[$1_1 + 444 >> 2]);
            $0_1 = $0_1 + $2_1 | 0;
            if (!(HEAPU8[HEAP32[$2_1 + 500 >> 2] + 20 | 0] & 2)) {
             $6_1 = Math_fround($6_1 + HEAPF32[$1_1 + 460 >> 2])
            }
            HEAPF32[$0_1 + 412 >> 2] = $6_1;
            break block10;
           }
           $0_1 = (HEAP32[($4_1 << 2) + 4844 >> 2] << 2) + $1_1 | 0;
           $6_1 = Math_fround(HEAPF32[$0_1 + 444 >> 2] + $68($8_1, $4_1, $3_1, $6_1));
           $6_1 = HEAPU8[HEAP32[$2_1 + 500 >> 2] + 20 | 0] & 2 ? $6_1 : Math_fround($6_1 + HEAPF32[$0_1 + 460 >> 2]);
           block28 : {
            block26 : {
             switch ($4_1 | 0) {
             case 3:
              $7_1 = Math_fround(HEAPF32[$1_1 + 404 >> 2] - HEAPF32[$2_1 + 404 >> 2]);
              $3_1 = 2;
              break block28;
             case 0:
             case 1:
              $7_1 = Math_fround(HEAPF32[$1_1 + 408 >> 2] - HEAPF32[$2_1 + 408 >> 2]);
              $3_1 = 1;
              block29 : {
               switch ($4_1 | 0) {
               case 0:
                break block28;
               case 1:
                break block29;
               default:
                break block5;
               };
              }
              $3_1 = 3;
              break block28;
             case 2:
              break block26;
             default:
              break block5;
             };
            }
            $7_1 = Math_fround(HEAPF32[$1_1 + 404 >> 2] - HEAPF32[$2_1 + 404 >> 2]);
            $3_1 = 0;
           }
           HEAPF32[(($3_1 << 2) + $2_1 | 0) + 412 >> 2] = $7_1 - $6_1;
           break block10;
          }
          $5_1 = (HEAPU8[$2_1 + 22 | 0] | HEAPU8[$2_1 + 23 | 0] << 8) & 15;
          if (!$5_1) {
           $5_1 = HEAPU8[$1_1 + 21 | 0] >>> 4 | 0
          }
          if (!(HEAPU8[$1_1 + 20 | 0] & 8) & ($5_1 | 0) == 5) {
           break block30
          }
          if (((HEAPU8[$1_1 + 21 | 0] | HEAPU8[$1_1 + 22 | 0] << 8) & 49152) == 32768) {
           switch ($5_1 - 2 | 0) {
           case 0:
            break block24;
           case 1:
            break block31;
           default:
            break block32;
           }
          }
          if ($5_1 >>> 0 > 8) {
           break block10
          }
          if (1 << $5_1 & 499) {
           break block31
          }
          if (($5_1 | 0) != 2) {
           break block32
          }
         }
         $0_1 = 0;
         block40 : {
          block45 : {
           block44 : {
            block43 : {
             block42 : {
              block36 : {
               block37 : {
                block33 : {
                 switch ($4_1 | 0) {
                 case 2:
                  $7_1 = HEAPF32[$1_1 + 404 >> 2];
                  $0_1 = 2;
                  $5_1 = $1_1 + 444 | 0;
                  break block37;
                 case 3:
                  $7_1 = HEAPF32[$1_1 + 404 >> 2];
                  $5_1 = $1_1 + 452 | 0;
                  break block37;
                 case 0:
                 case 1:
                  break block33;
                 default:
                  break block36;
                 };
                }
                $7_1 = HEAPF32[$1_1 + 408 >> 2];
                block39 : {
                 switch ($4_1 | 0) {
                 case 0:
                  $0_1 = 3;
                  $5_1 = $1_1 + 448 | 0;
                  break block37;
                 case 1:
                  break block39;
                 default:
                  break block36;
                 };
                }
                $0_1 = 1;
                $5_1 = $1_1 + 456 | 0;
               }
               $8_1 = $1_1 + 444 | 0;
               $7_1 = Math_fround(Math_fround($7_1 - HEAPF32[$5_1 >> 2]) - HEAPF32[$8_1 + ($0_1 << 2) >> 2]);
               if (HEAPU8[HEAP32[$2_1 + 500 >> 2] + 20 | 0] & 2) {
                break block40
               }
               block41 : {
                switch ($4_1 | 0) {
                case 0:
                 break block41;
                case 1:
                 break block42;
                case 2:
                 break block43;
                case 3:
                 break block44;
                default:
                 break block36;
                };
               }
               $5_1 = $1_1 + 464 | 0;
               $0_1 = 3;
               break block45;
              }
              $6();
              wasm2js_trap();
             }
             $5_1 = $1_1 + 472 | 0;
             $0_1 = 1;
             break block45;
            }
            $5_1 = $1_1 + 460 | 0;
            $0_1 = 2;
            break block45;
           }
           $5_1 = $1_1 + 468 | 0;
           $0_1 = 0;
          }
          $7_1 = Math_fround(Math_fround($7_1 - HEAPF32[$5_1 >> 2]) - HEAPF32[(($0_1 << 2) + $1_1 | 0) + 460 >> 2]);
         }
         $5_1 = $4_1 << 2;
         $0_1 = $2_1 + 20 | 0;
         $7_1 = Math_fround(Math_fround($7_1 - Math_fround(HEAPF32[((HEAP32[$5_1 + 4860 >> 2] << 2) + $2_1 | 0) + 404 >> 2] + Math_fround($4($0_1, $4_1, 1, $6_1) + $3($0_1, $4_1, 1, $6_1)))) * Math_fround(.5));
         $5_1 = HEAP32[$5_1 + 4828 >> 2];
         $6_1 = Math_fround(Math_fround($7_1 + HEAPF32[$8_1 + ($5_1 << 2) >> 2]) + $35($0_1, $4_1, $3_1, $6_1));
         $0_1 = ($5_1 << 2) + $2_1 | 0;
         if (!(HEAPU8[HEAP32[$2_1 + 500 >> 2] + 20 | 0] & 2)) {
          $6_1 = Math_fround($6_1 + HEAPF32[(($5_1 << 2) + $1_1 | 0) + 460 >> 2])
         }
         HEAPF32[$0_1 + 412 >> 2] = $6_1;
         break block10;
        }
        if (((HEAPU8[$1_1 + 21 | 0] | HEAPU8[$1_1 + 22 | 0] << 8) & 49152) != 32768) {
         break block31
        }
       }
       $0_1 = (HEAP32[($4_1 << 2) + 4844 >> 2] << 2) + $1_1 | 0;
       $6_1 = Math_fround(HEAPF32[$0_1 + 444 >> 2] + $68($8_1, $4_1, $3_1, $6_1));
       $6_1 = HEAPU8[HEAP32[$2_1 + 500 >> 2] + 20 | 0] & 2 ? $6_1 : Math_fround($6_1 + HEAPF32[$0_1 + 460 >> 2]);
       block46 : {
        switch ($4_1 | 0) {
        case 3:
         $7_1 = Math_fround(HEAPF32[$1_1 + 404 >> 2] - HEAPF32[$2_1 + 404 >> 2]);
         $3_1 = 2;
         break block49;
        case 0:
        case 1:
         break block46;
        case 2:
         break block47;
        default:
         break block5;
        };
       }
       $7_1 = Math_fround(HEAPF32[$1_1 + 408 >> 2] - HEAPF32[$2_1 + 408 >> 2]);
       $3_1 = 1;
       block50 : {
        switch ($4_1 | 0) {
        case 0:
         break block49;
        case 1:
         break block50;
        default:
         break block5;
        };
       }
       $3_1 = 3;
       break block49;
      }
      $6();
      wasm2js_trap();
     }
     $7_1 = Math_fround(HEAPF32[$1_1 + 404 >> 2] - HEAPF32[$2_1 + 404 >> 2]);
     $3_1 = 0;
    }
    HEAPF32[(($3_1 << 2) + $2_1 | 0) + 412 >> 2] = $7_1 - $6_1;
    break block10;
   }
   $0_1 = HEAP32[($4_1 << 2) + 4828 >> 2];
   $0_1 = $0_1 << 2;
   $1_1 = $0_1 + $1_1 | 0;
   $6_1 = Math_fround($35($8_1, $4_1, $3_1, $6_1) + HEAPF32[$1_1 + 444 >> 2]);
   $0_1 = $0_1 + $2_1 | 0;
   if (!(HEAPU8[HEAP32[$2_1 + 500 >> 2] + 20 | 0] & 2)) {
    $6_1 = Math_fround($6_1 + HEAPF32[$1_1 + 460 >> 2])
   }
   HEAPF32[$0_1 + 412 >> 2] = $6_1;
  }
  global$0 = $9 + 16 | 0;
 }
 
 function $101($0_1, $1_1, $2_1, $3_1) {
  var $4_1 = 0, $5_1 = Math_fround(0);
  $4_1 = global$0 - 16 | 0;
  global$0 = $4_1;
  $24($4_1 + 8 | 0, $0_1, HEAP32[($1_1 << 2) + 4844 >> 2], $2_1);
  $5_1 = Math_fround(NaN);
  block2 : {
   block1 : {
    switch (HEAPU8[$4_1 + 12 | 0] - 1 | 0) {
    case 0:
     $5_1 = HEAPF32[$4_1 + 8 >> 2];
     break block2;
    case 1:
     break block1;
    default:
     break block2;
    };
   }
   $5_1 = Math_fround(Math_fround(HEAPF32[$4_1 + 8 >> 2] * $3_1) * Math_fround(.009999999776482582));
  }
  global$0 = $4_1 + 16 | 0;
  return $5_1 == $5_1 ? $5_1 : Math_fround(0.0);
 }
 
 function $102($0_1, $1_1, $2_1, $3_1) {
  fimport$21($0_1 | 0, $1_1 | 0, 8, 0, $2_1 | 0, -1, $3_1 | 0);
 }
 
 function $103() {
  $58();
  wasm2js_trap();
 }
 
 function $104($0_1, $1_1) {
  if (!$0_1) {
   return 0
  }
  block : {
   if (!(($1_1 & -128) == 57216 | $1_1 >>> 0 <= 127)) {
    HEAP32[1919] = 25;
    $0_1 = -1;
    break block;
   }
   HEAP8[$0_1 | 0] = $1_1;
   $0_1 = 1;
  }
  return $0_1;
 }
 
 function $105($0_1, $1_1, $2_1, $3_1) {
  block3 : {
   switch ($1_1 - 9 | 0) {
   case 0:
    $1_1 = HEAP32[$2_1 >> 2];
    HEAP32[$2_1 >> 2] = $1_1 + 4;
    HEAP32[$0_1 >> 2] = HEAP32[$1_1 >> 2];
    return;
   case 6:
    $1_1 = HEAP32[$2_1 >> 2];
    HEAP32[$2_1 >> 2] = $1_1 + 4;
    $1_1 = HEAP16[$1_1 >> 1];
    HEAP32[$0_1 >> 2] = $1_1;
    HEAP32[$0_1 + 4 >> 2] = $1_1 >> 31;
    return;
   case 7:
    $1_1 = HEAP32[$2_1 >> 2];
    HEAP32[$2_1 >> 2] = $1_1 + 4;
    HEAP32[$0_1 >> 2] = HEAPU16[$1_1 >> 1];
    HEAP32[$0_1 + 4 >> 2] = 0;
    return;
   case 8:
    $1_1 = HEAP32[$2_1 >> 2];
    HEAP32[$2_1 >> 2] = $1_1 + 4;
    $1_1 = HEAP8[$1_1 | 0];
    HEAP32[$0_1 >> 2] = $1_1;
    HEAP32[$0_1 + 4 >> 2] = $1_1 >> 31;
    return;
   case 9:
    $1_1 = HEAP32[$2_1 >> 2];
    HEAP32[$2_1 >> 2] = $1_1 + 4;
    HEAP32[$0_1 >> 2] = HEAPU8[$1_1 | 0];
    HEAP32[$0_1 + 4 >> 2] = 0;
    return;
   case 16:
    $1_1 = HEAP32[$2_1 >> 2] + 7 & -8;
    HEAP32[$2_1 >> 2] = $1_1 + 8;
    HEAPF64[$0_1 >> 3] = HEAPF64[$1_1 >> 3];
    return;
   case 17:
    FUNCTION_TABLE[$3_1 | 0]($0_1, $2_1);
   default:
    return;
   case 1:
   case 4:
   case 14:
    $1_1 = HEAP32[$2_1 >> 2];
    HEAP32[$2_1 >> 2] = $1_1 + 4;
    $1_1 = HEAP32[$1_1 >> 2];
    HEAP32[$0_1 >> 2] = $1_1;
    HEAP32[$0_1 + 4 >> 2] = $1_1 >> 31;
    return;
   case 2:
   case 5:
   case 11:
   case 15:
    $1_1 = HEAP32[$2_1 >> 2];
    HEAP32[$2_1 >> 2] = $1_1 + 4;
    HEAP32[$0_1 >> 2] = HEAP32[$1_1 >> 2];
    HEAP32[$0_1 + 4 >> 2] = 0;
    return;
   case 3:
   case 10:
   case 12:
   case 13:
    break block3;
   };
  }
  $1_1 = HEAP32[$2_1 >> 2] + 7 & -8;
  HEAP32[$2_1 >> 2] = $1_1 + 8;
  $2_1 = HEAP32[$1_1 + 4 >> 2];
  HEAP32[$0_1 >> 2] = HEAP32[$1_1 >> 2];
  HEAP32[$0_1 + 4 >> 2] = $2_1;
 }
 
 function $106($0_1, $1_1, $2_1) {
  var $3_1 = 0, $4_1 = Math_fround(0), $5_1 = Math_fround(0), $6_1 = 0, $7_1 = 0;
  $3_1 = global$0 - 16 | 0;
  global$0 = $3_1;
  $6_1 = 1;
  $7_1 = $0_1 + 124 | 0;
  $1_1 = (($1_1 << 1) + $0_1 | 0) + 104 | 0;
  $1($3_1 + 8 | 0, $7_1, HEAPU16[$1_1 >> 1]);
  $4_1 = HEAPF32[$2_1 >> 2];
  $5_1 = HEAPF32[$3_1 + 8 >> 2];
  block1 : {
   block : {
    if ($4_1 != $5_1) {
     if ($5_1 == $5_1) {
      $2_1 = HEAPU8[$2_1 + 4 | 0];
      break block;
     }
     $6_1 = $4_1 != $4_1;
    }
    $2_1 = HEAPU8[$2_1 + 4 | 0];
    if (!$6_1) {
     break block
    }
    if (HEAPU8[$3_1 + 12 | 0] == ($2_1 & 255)) {
     break block1
    }
   }
   $27($7_1, $1_1, $4_1, $2_1);
   while (1) {
    $1_1 = HEAPU8[$0_1 | 0];
    if ($1_1 & 4) {
     break block1
    }
    HEAP8[$0_1 | 0] = $1_1 | 4;
    $1_1 = HEAP32[$0_1 + 16 >> 2];
    if ($1_1) {
     FUNCTION_TABLE[$1_1 | 0]($0_1)
    }
    HEAP32[$0_1 + 156 >> 2] = 2143289344;
    $0_1 = HEAP32[$0_1 + 484 >> 2];
    if ($0_1) {
     continue
    }
    break;
   };
  }
  global$0 = $3_1 + 16 | 0;
 }
 
 function $107($0_1) {
  var $1_1 = 0, $2_1 = 0, $3_1 = 0;
  $3_1 = HEAP32[$0_1 >> 2];
  while (1) {
   $2_1 = HEAP8[$3_1 | 0];
   if ($57($2_1)) {
    $3_1 = $3_1 + 1 | 0;
    HEAP32[$0_1 >> 2] = $3_1;
    if ($1_1 >>> 0 <= 214748364) {
     $2_1 = $2_1 - 48 | 0;
     $1_1 = Math_imul($1_1, 10);
     $1_1 = ($2_1 | 0) > ($1_1 ^ 2147483647) ? -1 : $2_1 + $1_1 | 0;
    } else {
     $1_1 = -1
    }
    continue;
   }
   break;
  };
  return $1_1;
 }
 
 function $108($0_1, $1_1, $2_1, $3_1, $4_1, $5_1, $6_1) {
  var $7_1 = 0, $8_1 = 0, $9 = 0, $10_1 = 0, $11_1 = 0, $12_1 = 0, $13_1 = 0, $14_1 = 0, $15_1 = 0, $16_1 = 0, $17_1 = 0, $18_1 = 0, $19_1 = 0, $20_1 = 0, $21_1 = 0, $22_1 = 0, $23_1 = 0, $24_1 = 0, $25_1 = 0, $26_1 = 0;
  $9 = global$0 - 80 | 0;
  global$0 = $9;
  HEAP32[$9 + 76 >> 2] = $1_1;
  $24_1 = $9 + 55 | 0;
  $19_1 = $9 + 56 | 0;
  block49 : {
   block48 : {
    block12 : {
     block : {
      label1 : while (1) {
       $10_1 = $1_1;
       if (($15_1 ^ 2147483647) < ($7_1 | 0)) {
        break block
       }
       $15_1 = $7_1 + $15_1 | 0;
       block14 : {
        block17 : {
         block7 : {
          $7_1 = $10_1;
          $8_1 = HEAPU8[$7_1 | 0];
          if ($8_1) {
           while (1) {
            block2 : {
             $1_1 = $8_1 & 255;
             block1 : {
              if (!$1_1) {
               $1_1 = $7_1;
               break block1;
              }
              if (($1_1 | 0) != 37) {
               break block2
              }
              $8_1 = $7_1;
              while (1) {
               if (HEAPU8[$8_1 + 1 | 0] != 37) {
                $1_1 = $8_1;
                break block1;
               }
               $7_1 = $7_1 + 1 | 0;
               $11_1 = HEAPU8[$8_1 + 2 | 0];
               $1_1 = $8_1 + 2 | 0;
               $8_1 = $1_1;
               if (($11_1 | 0) == 37) {
                continue
               }
               break;
              };
             }
             $7_1 = $7_1 - $10_1 | 0;
             $23_1 = $15_1 ^ 2147483647;
             if (($7_1 | 0) > ($23_1 | 0)) {
              break block
             }
             if ($0_1) {
              $8($0_1, $10_1, $7_1)
             }
             if ($7_1) {
              continue label1
             }
             HEAP32[$9 + 76 >> 2] = $1_1;
             $7_1 = $1_1 + 1 | 0;
             $17_1 = -1;
             $8_1 = HEAP8[$1_1 + 1 | 0];
             if (!(!$57($8_1) | HEAPU8[$1_1 + 2 | 0] != 36)) {
              $17_1 = $8_1 - 48 | 0;
              $20_1 = 1;
              $7_1 = $1_1 + 3 | 0;
             }
             HEAP32[$9 + 76 >> 2] = $7_1;
             $14_1 = 0;
             $8_1 = HEAP8[$7_1 | 0];
             $1_1 = $8_1 - 32 | 0;
             block4 : {
              if ($1_1 >>> 0 > 31) {
               $11_1 = $7_1;
               break block4;
              }
              $11_1 = $7_1;
              $1_1 = 1 << $1_1;
              if (!($1_1 & 75913)) {
               break block4
              }
              while (1) {
               $11_1 = $7_1 + 1 | 0;
               HEAP32[$9 + 76 >> 2] = $11_1;
               $14_1 = $1_1 | $14_1;
               $8_1 = HEAP8[$7_1 + 1 | 0];
               $1_1 = $8_1 - 32 | 0;
               if ($1_1 >>> 0 >= 32) {
                break block4
               }
               $7_1 = $11_1;
               $1_1 = 1 << $1_1;
               if ($1_1 & 75913) {
                continue
               }
               break;
              };
             }
             block8 : {
              if (($8_1 | 0) == 42) {
               $1_1 = HEAP8[$11_1 + 1 | 0];
               block6 : {
                if (!(!$57($1_1) | HEAPU8[$11_1 + 2 | 0] != 36)) {
                 HEAP32[(($1_1 << 2) + $4_1 | 0) - 192 >> 2] = 10;
                 $8_1 = $11_1 + 3 | 0;
                 $20_1 = 1;
                 $16_1 = HEAP32[((HEAP8[$11_1 + 1 | 0] << 3) + $3_1 | 0) - 384 >> 2];
                 break block6;
                }
                if ($20_1) {
                 break block7
                }
                $8_1 = $11_1 + 1 | 0;
                if (!$0_1) {
                 HEAP32[$9 + 76 >> 2] = $8_1;
                 $20_1 = 0;
                 $16_1 = 0;
                 break block8;
                }
                $1_1 = HEAP32[$2_1 >> 2];
                HEAP32[$2_1 >> 2] = $1_1 + 4;
                $20_1 = 0;
                $16_1 = HEAP32[$1_1 >> 2];
               }
               HEAP32[$9 + 76 >> 2] = $8_1;
               if (($16_1 | 0) >= 0) {
                break block8
               }
               $16_1 = 0 - $16_1 | 0;
               $14_1 = $14_1 | 8192;
               break block8;
              }
              $16_1 = $107($9 + 76 | 0);
              if (($16_1 | 0) < 0) {
               break block
              }
              $8_1 = HEAP32[$9 + 76 >> 2];
             }
             $7_1 = 0;
             $13_1 = -1;
             block9 : {
              if (HEAPU8[$8_1 | 0] != 46) {
               $1_1 = $8_1;
               $18_1 = 0;
               break block9;
              }
              if (HEAPU8[$8_1 + 1 | 0] == 42) {
               $1_1 = HEAP8[$8_1 + 2 | 0];
               block11 : {
                if (!(!$57($1_1) | HEAPU8[$8_1 + 3 | 0] != 36)) {
                 HEAP32[(($1_1 << 2) + $4_1 | 0) - 192 >> 2] = 10;
                 $1_1 = $8_1 + 4 | 0;
                 $13_1 = HEAP32[((HEAP8[$8_1 + 2 | 0] << 3) + $3_1 | 0) - 384 >> 2];
                 break block11;
                }
                if ($20_1) {
                 break block7
                }
                $1_1 = $8_1 + 2 | 0;
                $13_1 = 0;
                if (!$0_1) {
                 break block11
                }
                $8_1 = HEAP32[$2_1 >> 2];
                HEAP32[$2_1 >> 2] = $8_1 + 4;
                $13_1 = HEAP32[$8_1 >> 2];
               }
               HEAP32[$9 + 76 >> 2] = $1_1;
               $18_1 = ($13_1 ^ -1) >>> 31 | 0;
               break block9;
              }
              HEAP32[$9 + 76 >> 2] = $8_1 + 1;
              $13_1 = $107($9 + 76 | 0);
              $1_1 = HEAP32[$9 + 76 >> 2];
              $18_1 = 1;
             }
             while (1) {
              $12_1 = $7_1;
              $11_1 = 28;
              $21_1 = $1_1;
              $8_1 = HEAP8[$1_1 | 0];
              if ($8_1 - 123 >>> 0 < 4294967238) {
               break block12
              }
              $1_1 = $1_1 + 1 | 0;
              $7_1 = HEAPU8[($8_1 + Math_imul($7_1, 58) | 0) + 5503 | 0];
              if ($7_1 - 1 >>> 0 < 8) {
               continue
              }
              break;
             };
             HEAP32[$9 + 76 >> 2] = $1_1;
             block15 : {
              block13 : {
               if (($7_1 | 0) != 27) {
                if (!$7_1) {
                 break block12
                }
                if (($17_1 | 0) >= 0) {
                 HEAP32[($17_1 << 2) + $4_1 >> 2] = $7_1;
                 $7_1 = ($17_1 << 3) + $3_1 | 0;
                 $8_1 = HEAP32[$7_1 + 4 >> 2];
                 HEAP32[$9 + 64 >> 2] = HEAP32[$7_1 >> 2];
                 HEAP32[$9 + 68 >> 2] = $8_1;
                 break block13;
                }
                if (!$0_1) {
                 break block14
                }
                $105($9 - -64 | 0, $7_1, $2_1, $6_1);
                break block15;
               }
               if (($17_1 | 0) >= 0) {
                break block12
               }
              }
              $7_1 = 0;
              if (!$0_1) {
               continue label1
              }
             }
             $8_1 = $14_1 & -65537;
             $14_1 = $14_1 & 8192 ? $8_1 : $14_1;
             $17_1 = 0;
             $22_1 = 1167;
             $11_1 = $19_1;
             block19 : {
              block18 : {
               block46 : {
                block45 : {
                 block27 : {
                  block29 : {
                   block24 : {
                    block38 : {
                     block30 : {
                      block20 : {
                       block22 : {
                        block16 : {
                         block23 : {
                          block21 : {
                           block25 : {
                            block26 : {
                             $7_1 = HEAP8[$21_1 | 0];
                             $7_1 = $12_1 ? (($7_1 & 15) == 3 ? $7_1 & -33 : $7_1) : $7_1;
                             switch ($7_1 - 88 | 0) {
                             case 0:
                             case 32:
                              break block16;
                             case 1:
                             case 2:
                             case 3:
                             case 4:
                             case 5:
                             case 6:
                             case 7:
                             case 8:
                             case 10:
                             case 16:
                             case 18:
                             case 19:
                             case 20:
                             case 21:
                             case 25:
                             case 26:
                             case 28:
                             case 30:
                             case 31:
                              break block17;
                             case 9:
                             case 13:
                             case 14:
                             case 15:
                              break block18;
                             case 11:
                              break block19;
                             case 12:
                             case 17:
                              break block20;
                             case 22:
                              break block21;
                             case 23:
                              break block22;
                             case 24:
                              break block23;
                             case 27:
                              break block24;
                             case 29:
                              break block25;
                             default:
                              break block26;
                             };
                            }
                            block28 : {
                             switch ($7_1 - 65 | 0) {
                             case 1:
                             case 3:
                              break block17;
                             case 0:
                             case 4:
                             case 5:
                             case 6:
                              break block18;
                             case 2:
                              break block27;
                             default:
                              break block28;
                             };
                            }
                            if (($7_1 | 0) == 83) {
                             break block29
                            }
                            break block17;
                           }
                           $8_1 = HEAP32[$9 + 64 >> 2];
                           $12_1 = HEAP32[$9 + 68 >> 2];
                           $7_1 = 1167;
                           break block30;
                          }
                          $7_1 = 0;
                          block37 : {
                           switch ($12_1 & 255) {
                           case 0:
                            HEAP32[HEAP32[$9 + 64 >> 2] >> 2] = $15_1;
                            continue label1;
                           case 1:
                            HEAP32[HEAP32[$9 + 64 >> 2] >> 2] = $15_1;
                            continue label1;
                           case 2:
                            $10_1 = HEAP32[$9 + 64 >> 2];
                            HEAP32[$10_1 >> 2] = $15_1;
                            HEAP32[$10_1 + 4 >> 2] = $15_1 >> 31;
                            continue label1;
                           case 3:
                            HEAP16[HEAP32[$9 + 64 >> 2] >> 1] = $15_1;
                            continue label1;
                           case 4:
                            HEAP8[HEAP32[$9 + 64 >> 2]] = $15_1;
                            continue label1;
                           case 6:
                            HEAP32[HEAP32[$9 + 64 >> 2] >> 2] = $15_1;
                            continue label1;
                           case 7:
                            break block37;
                           default:
                            continue label1;
                           };
                          }
                          $10_1 = HEAP32[$9 + 64 >> 2];
                          HEAP32[$10_1 >> 2] = $15_1;
                          HEAP32[$10_1 + 4 >> 2] = $15_1 >> 31;
                          continue label1;
                         }
                         $13_1 = $13_1 >>> 0 <= 8 ? 8 : $13_1;
                         $14_1 = $14_1 | 8;
                         $7_1 = 120;
                        }
                        $10_1 = $19_1;
                        $8_1 = HEAP32[$9 + 64 >> 2];
                        $12_1 = HEAP32[$9 + 68 >> 2];
                        if ($8_1 | $12_1) {
                         $25_1 = $7_1 & 32;
                         while (1) {
                          $10_1 = $10_1 - 1 | 0;
                          HEAP8[$10_1 | 0] = $25_1 | HEAPU8[($8_1 & 15) + 6032 | 0];
                          $26_1 = !$12_1 & $8_1 >>> 0 > 15 | ($12_1 | 0) != 0;
                          $21_1 = $12_1;
                          $12_1 = $12_1 >>> 4 | 0;
                          $8_1 = ($21_1 & 15) << 28 | $8_1 >>> 4;
                          if ($26_1) {
                           continue
                          }
                          break;
                         };
                        }
                        if (!($14_1 & 8) | !(HEAP32[$9 + 64 >> 2] | HEAP32[$9 + 68 >> 2])) {
                         break block38
                        }
                        $22_1 = ($7_1 >>> 4 | 0) + 1167 | 0;
                        $17_1 = 2;
                        break block38;
                       }
                       $7_1 = $19_1;
                       $10_1 = HEAP32[$9 + 68 >> 2];
                       $12_1 = $10_1;
                       $8_1 = HEAP32[$9 + 64 >> 2];
                       if ($10_1 | $8_1) {
                        while (1) {
                         $7_1 = $7_1 - 1 | 0;
                         HEAP8[$7_1 | 0] = $8_1 & 7 | 48;
                         $21_1 = !$12_1 & $8_1 >>> 0 > 7 | ($12_1 | 0) != 0;
                         $10_1 = $12_1;
                         $12_1 = $10_1 >>> 3 | 0;
                         $8_1 = ($10_1 & 7) << 29 | $8_1 >>> 3;
                         if ($21_1) {
                          continue
                         }
                         break;
                        }
                       }
                       $10_1 = $7_1;
                       if (!($14_1 & 8)) {
                        break block38
                       }
                       $7_1 = $19_1 - $7_1 | 0;
                       $13_1 = ($7_1 | 0) < ($13_1 | 0) ? $13_1 : $7_1 + 1 | 0;
                       break block38;
                      }
                      $8_1 = HEAP32[$9 + 64 >> 2];
                      $7_1 = HEAP32[$9 + 68 >> 2];
                      $12_1 = $7_1;
                      if (($7_1 | 0) < 0) {
                       $10_1 = 0 - ($7_1 + (($8_1 | 0) != 0) | 0) | 0;
                       $12_1 = $10_1;
                       $8_1 = 0 - $8_1 | 0;
                       HEAP32[$9 + 64 >> 2] = $8_1;
                       HEAP32[$9 + 68 >> 2] = $10_1;
                       $17_1 = 1;
                       $7_1 = 1167;
                       break block30;
                      }
                      if ($14_1 & 2048) {
                       $17_1 = 1;
                       $7_1 = 1168;
                       break block30;
                      }
                      $17_1 = $14_1 & 1;
                      $7_1 = $17_1 ? 1169 : 1167;
                     }
                     $22_1 = $7_1;
                     $10_1 = $41($8_1, $12_1, $19_1);
                    }
                    if (($13_1 | 0) < 0 ? $18_1 : 0) {
                     break block
                    }
                    $14_1 = $18_1 ? $14_1 & -65537 : $14_1;
                    $7_1 = HEAP32[$9 + 64 >> 2];
                    $8_1 = HEAP32[$9 + 68 >> 2];
                    if (!(($7_1 | $8_1) != 0 | $13_1)) {
                     $10_1 = $19_1;
                     $13_1 = 0;
                     break block17;
                    }
                    $7_1 = !($7_1 | $8_1) + ($19_1 - $10_1 | 0) | 0;
                    $13_1 = ($7_1 | 0) < ($13_1 | 0) ? $13_1 : $7_1;
                    break block17;
                   }
                   $14_1 = 0;
                   $18_1 = $13_1 >>> 0 >= 2147483647 ? 2147483647 : $13_1;
                   $12_1 = $18_1;
                   $11_1 = ($12_1 | 0) != 0;
                   block44 : {
                    block41 : {
                     $7_1 = HEAP32[$9 + 64 >> 2];
                     $10_1 = $7_1 ? $7_1 : 4750;
                     $7_1 = $10_1;
                     block43 : {
                      block40 : {
                       block39 : {
                        if (!($7_1 & 3) | !$12_1) {
                         break block39
                        }
                        while (1) {
                         $14_1 = HEAPU8[$7_1 | 0];
                         if (!$14_1) {
                          break block40
                         }
                         $12_1 = $12_1 - 1 | 0;
                         $11_1 = ($12_1 | 0) != 0;
                         $7_1 = $7_1 + 1 | 0;
                         if (!($7_1 & 3)) {
                          break block39
                         }
                         if ($12_1) {
                          continue
                         }
                         break;
                        };
                       }
                       if (!$11_1) {
                        break block41
                       }
                       block42 : {
                        if (!(!HEAPU8[$7_1 | 0] | $12_1 >>> 0 < 4)) {
                         while (1) {
                          $11_1 = HEAP32[$7_1 >> 2];
                          if (($11_1 ^ -1) & $11_1 - 16843009 & -2139062144) {
                           break block42
                          }
                          $7_1 = $7_1 + 4 | 0;
                          $12_1 = $12_1 - 4 | 0;
                          if ($12_1 >>> 0 > 3) {
                           continue
                          }
                          break;
                         }
                        }
                        if (!$12_1) {
                         break block41
                        }
                       }
                       $11_1 = 0;
                       break block43;
                      }
                      $11_1 = 1;
                     }
                     while (1) {
                      if (!$11_1) {
                       $14_1 = HEAPU8[$7_1 | 0];
                       $11_1 = 1;
                       continue;
                      }
                      if (!$14_1) {
                       break block44
                      }
                      $7_1 = $7_1 + 1 | 0;
                      $12_1 = $12_1 - 1 | 0;
                      if (!$12_1) {
                       break block41
                      }
                      $11_1 = 0;
                      continue;
                     };
                    }
                    $7_1 = 0;
                   }
                   $7_1 = $7_1 ? $7_1 - $10_1 | 0 : $18_1;
                   $11_1 = $7_1 + $10_1 | 0;
                   if (($13_1 | 0) >= 0) {
                    $14_1 = $8_1;
                    $13_1 = $7_1;
                    break block17;
                   }
                   $14_1 = $8_1;
                   $13_1 = $7_1;
                   if (HEAPU8[$11_1 | 0]) {
                    break block
                   }
                   break block17;
                  }
                  if ($13_1) {
                   $8_1 = HEAP32[$9 + 64 >> 2];
                   break block45;
                  }
                  $7_1 = 0;
                  $11($0_1, 32, $16_1, 0, $14_1);
                  break block46;
                 }
                 HEAP32[$9 + 12 >> 2] = 0;
                 HEAP32[$9 + 8 >> 2] = HEAP32[$9 + 64 >> 2];
                 $8_1 = $9 + 8 | 0;
                 HEAP32[$9 + 64 >> 2] = $8_1;
                 $13_1 = -1;
                }
                $7_1 = 0;
                block47 : {
                 while (1) {
                  $10_1 = HEAP32[$8_1 >> 2];
                  if (!$10_1) {
                   break block47
                  }
                  $10_1 = $104($9 + 4 | 0, $10_1);
                  $11_1 = ($10_1 | 0) < 0;
                  if (!($11_1 | $10_1 >>> 0 > $13_1 - $7_1 >>> 0)) {
                   $8_1 = $8_1 + 4 | 0;
                   $7_1 = $7_1 + $10_1 | 0;
                   if ($13_1 >>> 0 > $7_1 >>> 0) {
                    continue
                   }
                   break block47;
                  }
                  break;
                 };
                 if ($11_1) {
                  break block48
                 }
                }
                $11_1 = 61;
                if (($7_1 | 0) < 0) {
                 break block12
                }
                $11($0_1, 32, $16_1, $7_1, $14_1);
                if (!$7_1) {
                 $7_1 = 0;
                 break block46;
                }
                $11_1 = 0;
                $8_1 = HEAP32[$9 + 64 >> 2];
                while (1) {
                 $10_1 = HEAP32[$8_1 >> 2];
                 if (!$10_1) {
                  break block46
                 }
                 $12_1 = $9 + 4 | 0;
                 $10_1 = $104($12_1, $10_1);
                 $11_1 = $10_1 + $11_1 | 0;
                 if ($11_1 >>> 0 > $7_1 >>> 0) {
                  break block46
                 }
                 $8($0_1, $12_1, $10_1);
                 $8_1 = $8_1 + 4 | 0;
                 if ($7_1 >>> 0 > $11_1 >>> 0) {
                  continue
                 }
                 break;
                };
               }
               $11($0_1, 32, $16_1, $7_1, $14_1 ^ 8192);
               $7_1 = ($7_1 | 0) < ($16_1 | 0) ? $16_1 : $7_1;
               continue label1;
              }
              if (($13_1 | 0) < 0 ? $18_1 : 0) {
               break block
              }
              $11_1 = 61;
              $7_1 = FUNCTION_TABLE[$5_1 | 0]($0_1, HEAPF64[$9 + 64 >> 3], $16_1, $13_1, $14_1, $7_1) | 0;
              if (($7_1 | 0) >= 0) {
               continue label1
              }
              break block12;
             }
             HEAP8[$9 + 55 | 0] = HEAP32[$9 + 64 >> 2];
             $13_1 = 1;
             $10_1 = $24_1;
             $14_1 = $8_1;
             break block17;
            }
            $8_1 = HEAPU8[$7_1 + 1 | 0];
            $7_1 = $7_1 + 1 | 0;
            continue;
           }
          }
          if ($0_1) {
           break block49
          }
          if (!$20_1) {
           break block14
          }
          $7_1 = 1;
          while (1) {
           $0_1 = HEAP32[($7_1 << 2) + $4_1 >> 2];
           if ($0_1) {
            $105(($7_1 << 3) + $3_1 | 0, $0_1, $2_1, $6_1);
            $15_1 = 1;
            $7_1 = $7_1 + 1 | 0;
            if (($7_1 | 0) != 10) {
             continue
            }
            break block49;
           }
           break;
          };
          $15_1 = 1;
          if ($7_1 >>> 0 >= 10) {
           break block49
          }
          while (1) {
           if (HEAP32[($7_1 << 2) + $4_1 >> 2]) {
            break block7
           }
           $7_1 = $7_1 + 1 | 0;
           if (($7_1 | 0) != 10) {
            continue
           }
           break;
          };
          break block49;
         }
         $11_1 = 28;
         break block12;
        }
        $12_1 = $11_1 - $10_1 | 0;
        $13_1 = ($12_1 | 0) < ($13_1 | 0) ? $13_1 : $12_1;
        if (($13_1 | 0) > ($17_1 ^ 2147483647)) {
         break block
        }
        $11_1 = 61;
        $8_1 = $13_1 + $17_1 | 0;
        $7_1 = ($8_1 | 0) < ($16_1 | 0) ? $16_1 : $8_1;
        if (($23_1 | 0) < ($7_1 | 0)) {
         break block12
        }
        $11($0_1, 32, $7_1, $8_1, $14_1);
        $8($0_1, $22_1, $17_1);
        $11($0_1, 48, $7_1, $8_1, $14_1 ^ 65536);
        $11($0_1, 48, $13_1, $12_1, 0);
        $8($0_1, $10_1, $12_1);
        $11($0_1, 32, $7_1, $8_1, $14_1 ^ 8192);
        continue;
       }
       break;
      };
      $15_1 = 0;
      break block49;
     }
     $11_1 = 61;
    }
    HEAP32[1919] = $11_1;
   }
   $15_1 = -1;
  }
  global$0 = $9 + 80 | 0;
  return $15_1;
 }
 
 function $109($0_1, $1_1, $2_1, $3_1, $4_1) {
  var $5_1 = 0, $6_1 = 0, $7_1 = 0, $8_1 = 0;
  $5_1 = global$0 - 208 | 0;
  global$0 = $5_1;
  HEAP32[$5_1 + 204 >> 2] = $2_1;
  $2_1 = $5_1 + 160 | 0;
  $12($2_1, 0, 40);
  HEAP32[$5_1 + 200 >> 2] = HEAP32[$5_1 + 204 >> 2];
  block : {
   if (($108(0, $1_1, $5_1 + 200 | 0, $5_1 + 80 | 0, $2_1, $3_1, $4_1) | 0) < 0) {
    $4_1 = -1;
    break block;
   }
   $8_1 = HEAP32[$0_1 + 76 >> 2] >= 0;
   $6_1 = HEAP32[$0_1 >> 2];
   if (HEAP32[$0_1 + 72 >> 2] <= 0) {
    HEAP32[$0_1 >> 2] = $6_1 & -33
   }
   block3 : {
    block2 : {
     block1 : {
      if (!HEAP32[$0_1 + 48 >> 2]) {
       HEAP32[$0_1 + 48 >> 2] = 80;
       HEAP32[$0_1 + 28 >> 2] = 0;
       HEAP32[$0_1 + 16 >> 2] = 0;
       HEAP32[$0_1 + 20 >> 2] = 0;
       $7_1 = HEAP32[$0_1 + 44 >> 2];
       HEAP32[$0_1 + 44 >> 2] = $5_1;
       break block1;
      }
      if (HEAP32[$0_1 + 16 >> 2]) {
       break block2
      }
     }
     $2_1 = -1;
     if ($127($0_1)) {
      break block3
     }
    }
    $2_1 = $108($0_1, $1_1, $5_1 + 200 | 0, $5_1 + 80 | 0, $5_1 + 160 | 0, $3_1, $4_1);
   }
   if ($7_1) {
    FUNCTION_TABLE[HEAP32[$0_1 + 36 >> 2]]($0_1, 0, 0) | 0;
    HEAP32[$0_1 + 48 >> 2] = 0;
    HEAP32[$0_1 + 44 >> 2] = $7_1;
    HEAP32[$0_1 + 28 >> 2] = 0;
    $1_1 = HEAP32[$0_1 + 20 >> 2];
    HEAP32[$0_1 + 16 >> 2] = 0;
    HEAP32[$0_1 + 20 >> 2] = 0;
    $2_1 = $1_1 ? $2_1 : -1;
   }
   $1_1 = $0_1;
   $0_1 = HEAP32[$0_1 >> 2];
   HEAP32[$1_1 >> 2] = $0_1 | $6_1 & 32;
   $4_1 = $0_1 & 32 ? -1 : $2_1;
   if (!$8_1) {
    break block
   }
  }
  global$0 = $5_1 + 208 | 0;
  return $4_1;
 }
 
 function $110($0_1, $1_1) {
  var $2_1 = 0, $3_1 = 0, $4_1 = 0;
  wasm2js_scratch_store_f64(+$0_1);
  $3_1 = wasm2js_scratch_load_i32(1) | 0;
  $4_1 = wasm2js_scratch_load_i32(0) | 0;
  $2_1 = $3_1 >>> 20 & 2047;
  if (($2_1 | 0) != 2047) {
   if (!$2_1) {
    if ($0_1 == 0.0) {
     $2_1 = 0
    } else {
     $0_1 = $110($0_1 * 18446744073709551615.0, $1_1);
     $2_1 = HEAP32[$1_1 >> 2] + -64 | 0;
    }
    HEAP32[$1_1 >> 2] = $2_1;
    return $0_1;
   }
   HEAP32[$1_1 >> 2] = $2_1 - 1022;
   wasm2js_scratch_store_i32(0, $4_1 | 0);
   wasm2js_scratch_store_i32(1, $3_1 & -2146435073 | 1071644672);
   $0_1 = +wasm2js_scratch_load_f64();
  }
  return $0_1;
 }
 
 function $111($0_1) {
  if (!$0_1) {
   return 0
  }
  HEAP32[1919] = $0_1;
  return -1;
 }
 
 function $112($0_1, $1_1, $2_1) {
  var $3_1 = 0, $4_1 = Math_fround(0), $5_1 = Math_fround(0), $6_1 = 0, $7_1 = 0;
  $3_1 = global$0 - 16 | 0;
  global$0 = $3_1;
  $6_1 = 1;
  $7_1 = $0_1 + 124 | 0;
  $1_1 = (($1_1 << 1) + $0_1 | 0) + 68 | 0;
  $1($3_1 + 8 | 0, $7_1, HEAPU16[$1_1 >> 1]);
  $4_1 = HEAPF32[$2_1 >> 2];
  $5_1 = HEAPF32[$3_1 + 8 >> 2];
  block1 : {
   block : {
    if ($4_1 != $5_1) {
     if ($5_1 == $5_1) {
      $2_1 = HEAPU8[$2_1 + 4 | 0];
      break block;
     }
     $6_1 = $4_1 != $4_1;
    }
    $2_1 = HEAPU8[$2_1 + 4 | 0];
    if (!$6_1) {
     break block
    }
    if (HEAPU8[$3_1 + 12 | 0] == ($2_1 & 255)) {
     break block1
    }
   }
   $27($7_1, $1_1, $4_1, $2_1);
   while (1) {
    $1_1 = HEAPU8[$0_1 | 0];
    if ($1_1 & 4) {
     break block1
    }
    HEAP8[$0_1 | 0] = $1_1 | 4;
    $1_1 = HEAP32[$0_1 + 16 >> 2];
    if ($1_1) {
     FUNCTION_TABLE[$1_1 | 0]($0_1)
    }
    HEAP32[$0_1 + 156 >> 2] = 2143289344;
    $0_1 = HEAP32[$0_1 + 484 >> 2];
    if ($0_1) {
     continue
    }
    break;
   };
  }
  global$0 = $3_1 + 16 | 0;
 }
 
 function $113() {
  fimport$28(7636, 3624);
  fimport$27(7637, 2826, 1, 1, 0);
  fimport$4(7638, 2429, 1, -128, 127);
  fimport$4(7639, 2422, 1, -128, 127);
  fimport$4(7640, 2420, 1, 0, 255);
  fimport$4(7641, 1300, 2, -32768, 32767);
  fimport$4(7642, 1291, 2, 0, 65535);
  fimport$4(7643, 1329, 4, -2147483648, 2147483647);
  fimport$4(7644, 1320, 4, 0, -1);
  fimport$4(7645, 3192, 4, -2147483648, 2147483647);
  fimport$4(7646, 3183, 4, 0, -1);
  $102(7647, 2063, -2147483648, 2147483647);
  $102(7648, 2062, 0, -1);
  fimport$13(7649, 2056, 4);
  fimport$13(7650, 3572, 8);
  fimport$14(7651, 3236);
  fimport$14(7652, 4377);
  fimport$8(7653, 4, 3223);
  fimport$8(7654, 2, 3248);
  fimport$8(7655, 4, 3263);
  fimport$26(7656, 2831);
  fimport$1(7657, 0, 4308);
  fimport$1(7658, 0, 4410);
  fimport$1(7659, 1, 4338);
  fimport$1(7660, 2, 3940);
  fimport$1(7661, 3, 3971);
  fimport$1(7662, 4, 4011);
  fimport$1(7663, 5, 4040);
  fimport$1(7664, 4, 4447);
  fimport$1(7665, 5, 4477);
  fimport$1(7658, 0, 4142);
  fimport$1(7659, 1, 4109);
  fimport$1(7660, 2, 4208);
  fimport$1(7661, 3, 4174);
  fimport$1(7662, 4, 4275);
  fimport$1(7663, 5, 4241);
  fimport$1(7666, 6, 4078);
  fimport$1(7667, 7, 4516);
 }
 
 function $114($0_1) {
  $0_1 = $0_1 | 0;
  HEAP32[$0_1 >> 2] = 4980;
  if (HEAPU8[$0_1 + 4 | 0]) {
   $72(HEAP32[$0_1 + 8 >> 2], 2045)
  }
  fimport$6(HEAP32[$0_1 + 8 >> 2]);
  return $0_1 | 0;
 }
 
 function $115($0_1) {
  $0_1 = $0_1 | 0;
  wasm2js_trap();
 }
 
 function $116($0_1) {
  $0_1 = $0_1 | 0;
  HEAP32[$0_1 >> 2] = 5100;
  if (HEAPU8[$0_1 + 4 | 0]) {
   $72(HEAP32[$0_1 + 8 >> 2], 2045)
  }
  fimport$6(HEAP32[$0_1 + 8 >> 2]);
  return $0_1 | 0;
 }
 
 function $117($0_1, $1_1) {
  var $2_1 = 0, $3_1 = 0;
  $2_1 = $0(4);
  HEAP32[$2_1 >> 2] = $1_1;
  $3_1 = $0(4);
  HEAP32[$3_1 >> 2] = $1_1;
  fimport$7(7587, $0_1 | 0, 7650, 5242, 193, $2_1 | 0, 7650, 5246, 194, $3_1 | 0);
 }
 
 function $118($0_1, $1_1, $2_1) {
  $0_1 = $0_1 | 0;
  $1_1 = $1_1 | 0;
  $2_1 = $2_1 | 0;
  var $3_1 = 0;
  $3_1 = HEAP32[$0_1 >> 2];
  $0_1 = HEAP32[$0_1 + 4 >> 2];
  $1_1 = ($0_1 >> 1) + $1_1 | 0;
  if ($0_1 & 1) {
   $3_1 = HEAP32[$3_1 + HEAP32[$1_1 >> 2] >> 2]
  }
  return FUNCTION_TABLE[$3_1 | 0]($1_1, $2_1) | 0;
 }
 
 function $119($0_1, $1_1, $2_1, $3_1) {
  $0_1 = $0_1 | 0;
  $1_1 = $1_1 | 0;
  $2_1 = $2_1 | 0;
  $3_1 = $3_1 | 0;
  var $4_1 = 0;
  $4_1 = HEAP32[$0_1 >> 2];
  $0_1 = HEAP32[$0_1 + 4 >> 2];
  $1_1 = ($0_1 >> 1) + $1_1 | 0;
  if ($0_1 & 1) {
   $4_1 = HEAP32[$4_1 + HEAP32[$1_1 >> 2] >> 2]
  }
  FUNCTION_TABLE[$4_1 | 0]($1_1, $2_1, $3_1);
 }
 
 function $120($0_1, $1_1) {
  $0_1 = $0_1 | 0;
  $1_1 = $1_1 | 0;
  FUNCTION_TABLE[$0_1 | 0]($1_1);
 }
 
 function $121($0_1) {
  $0_1 = $0_1 | 0;
  return FUNCTION_TABLE[$0_1 | 0]() | 0;
 }
 
 function $122($0_1, $1_1) {
  $0_1 = $0_1 | 0;
  $1_1 = $1_1 | 0;
  var $2_1 = 0;
  $2_1 = HEAP32[$0_1 >> 2];
  $0_1 = HEAP32[$0_1 + 4 >> 2];
  $1_1 = ($0_1 >> 1) + $1_1 | 0;
  if ($0_1 & 1) {
   $2_1 = HEAP32[$2_1 + HEAP32[$1_1 >> 2] >> 2]
  }
  FUNCTION_TABLE[$2_1 | 0]($1_1);
 }
 
 function $123($0_1, $1_1) {
  $0_1 = $0_1 | 0;
  $1_1 = $1_1 | 0;
  var $2_1 = 0;
  $2_1 = global$0 - 16 | 0;
  global$0 = $2_1;
  HEAP32[$2_1 + 8 >> 2] = $1_1;
  $0_1 = FUNCTION_TABLE[$0_1 | 0]($2_1 + 8 | 0) | 0;
  fimport$6(HEAP32[$2_1 + 8 >> 2]);
  global$0 = $2_1 + 16 | 0;
  return $0_1 | 0;
 }
 
 function $124($0_1, $1_1) {
  $0_1 = $0_1 | 0;
  $1_1 = $1_1 | 0;
  FUNCTION_TABLE[HEAP32[$0_1 >> 2]]($1_1);
 }
 
 function $125($0_1) {
  $0_1 = $0_1 | 0;
  HEAP8[$0_1 + 4 | 0] = 1;
 }
 
 function $126() {
  var $0_1 = 0, $1_1 = 0;
  fimport$5(7584, 7585, 7586, 0, 4876, 7, 4879, 0, 4879, 0, 2905, 4881, 8);
  $0_1 = $0(8);
  HEAP32[$0_1 >> 2] = 8;
  HEAP32[$0_1 + 4 >> 2] = 1;
  fimport$0(7584, 3479, 6, 4896, 4920, 9, $0_1 | 0, 1);
  fimport$5(7588, 7589, 7590, 7584, 4876, 10, 4876, 11, 4876, 12, 2232, 4881, 13);
  $0_1 = $0(4);
  HEAP32[$0_1 >> 2] = 14;
  fimport$0(7588, 2664, 2, 4928, 4936, 15, $0_1 | 0, 0);
  fimport$3(7584, 1571, 2, 4940, 4948, 16, 17);
  fimport$3(7584, 3584, 3, 5028, 5040, 18, 19);
  fimport$5(7608, 7609, 7610, 0, 4876, 20, 4879, 0, 4879, 0, 2921, 4881, 21);
  $0_1 = $0(8);
  HEAP32[$0_1 >> 2] = 8;
  HEAP32[$0_1 + 4 >> 2] = 1;
  fimport$0(7608, 3688, 2, 5048, 4936, 22, $0_1 | 0, 1);
  fimport$5(7611, 7612, 7613, 7608, 4876, 23, 4876, 24, 4876, 25, 2255, 4881, 26);
  $0_1 = $0(4);
  HEAP32[$0_1 >> 2] = 27;
  fimport$0(7611, 2664, 2, 5056, 4936, 28, $0_1 | 0, 0);
  fimport$3(7608, 1571, 2, 5064, 4948, 29, 30);
  fimport$3(7608, 3584, 3, 5028, 5040, 18, 31);
  fimport$5(7614, 7615, 7616, 0, 4876, 32, 4879, 0, 4879, 0, 3418, 4881, 33);
  fimport$15(7614, 1, 5112, 4876, 34, 35);
  fimport$3(7614, 3472, 1, 5112, 4876, 34, 35);
  fimport$3(7614, 1129, 2, 5116, 4936, 36, 37);
  $0_1 = $0(8);
  HEAP32[$0_1 + 4 >> 2] = 0;
  HEAP32[$0_1 >> 2] = 38;
  fimport$0(7614, 3629, 4, 5136, 5152, 39, $0_1 | 0, 0);
  $0_1 = $0(8);
  HEAP32[$0_1 + 4 >> 2] = 0;
  HEAP32[$0_1 >> 2] = 40;
  fimport$0(7614, 2212, 3, 5160, 5172, 41, $0_1 | 0, 0);
  $0_1 = $0(8);
  HEAP32[$0_1 + 4 >> 2] = 0;
  HEAP32[$0_1 >> 2] = 42;
  fimport$0(7614, 3784, 3, 5180, 5192, 43, $0_1 | 0, 0);
  $0_1 = $0(8);
  HEAP32[$0_1 + 4 >> 2] = 0;
  HEAP32[$0_1 >> 2] = 44;
  fimport$0(7614, 2086, 3, 5200, 5192, 45, $0_1 | 0, 0);
  $0_1 = $0(8);
  HEAP32[$0_1 + 4 >> 2] = 0;
  HEAP32[$0_1 >> 2] = 46;
  fimport$0(7614, 3659, 3, 5212, 5040, 47, $0_1 | 0, 0);
  $0_1 = $0(8);
  HEAP32[$0_1 + 4 >> 2] = 0;
  HEAP32[$0_1 >> 2] = 48;
  fimport$0(7614, 3794, 2, 5224, 4948, 49, $0_1 | 0, 0);
  $0_1 = $0(8);
  HEAP32[$0_1 + 4 >> 2] = 0;
  HEAP32[$0_1 >> 2] = 50;
  fimport$0(7614, 2071, 2, 5232, 4948, 51, $0_1 | 0, 0);
  fimport$10(7617, 1284, 5240, 52, 4881, 53);
  $42(2018, 0);
  $42(1898, 8);
  $42(2434, 16);
  $42(2801, 24);
  $42(2947, 32);
  $42(1904, 40);
  fimport$9(7617);
  fimport$10(7587, 3455, 5240, 54, 4881, 55);
  $117(2947, 0);
  $117(1904, 8);
  fimport$9(7587);
  fimport$10(7618, 3466, 5240, 56, 4881, 57);
  $0_1 = $0(4);
  HEAP32[$0_1 >> 2] = 8;
  $1_1 = $0(4);
  HEAP32[$1_1 >> 2] = 8;
  fimport$7(7618, 3460, 7650, 5242, 58, $0_1 | 0, 7650, 5246, 59, $1_1 | 0);
  $0_1 = $0(4);
  HEAP32[$0_1 >> 2] = 0;
  $1_1 = $0(4);
  HEAP32[$1_1 >> 2] = 0;
  fimport$7(7618, 1893, 7643, 4948, 60, $0_1 | 0, 7643, 5192, 61, $1_1 | 0);
  fimport$9(7618);
  fimport$5(7619, 7620, 7621, 0, 4876, 62, 4879, 0, 4879, 0, 3579, 4881, 63);
  fimport$15(7619, 1, 5252, 4876, 64, 65);
  fimport$3(7619, 1879, 1, 5252, 4876, 64, 65);
  fimport$3(7619, 3408, 2, 5256, 4948, 66, 67);
  fimport$3(7619, 1129, 2, 5264, 4936, 68, 69);
  $0_1 = $0(8);
  HEAP32[$0_1 + 4 >> 2] = 0;
  HEAP32[$0_1 >> 2] = 70;
  fimport$0(7619, 2039, 2, 5264, 4936, 71, $0_1 | 0, 0);
  $0_1 = $0(8);
  HEAP32[$0_1 + 4 >> 2] = 0;
  HEAP32[$0_1 >> 2] = 72;
  fimport$0(7619, 3562, 3, 5272, 5192, 73, $0_1 | 0, 0);
  $0_1 = $0(8);
  HEAP32[$0_1 + 4 >> 2] = 0;
  HEAP32[$0_1 >> 2] = 74;
  fimport$0(7619, 3487, 3, 5284, 5192, 75, $0_1 | 0, 0);
  $0_1 = $0(8);
  HEAP32[$0_1 + 4 >> 2] = 0;
  HEAP32[$0_1 >> 2] = 76;
  fimport$0(7619, 2640, 4, 5296, 5312, 77, $0_1 | 0, 0);
  $0_1 = $0(8);
  HEAP32[$0_1 + 4 >> 2] = 0;
  HEAP32[$0_1 >> 2] = 78;
  fimport$0(7619, 1672, 4, 5296, 5312, 77, $0_1 | 0, 0);
  $0_1 = $0(8);
  HEAP32[$0_1 + 4 >> 2] = 0;
  HEAP32[$0_1 >> 2] = 79;
  fimport$0(7619, 2525, 3, 5284, 5192, 75, $0_1 | 0, 0);
  $0_1 = $0(8);
  HEAP32[$0_1 + 4 >> 2] = 0;
  HEAP32[$0_1 >> 2] = 80;
  fimport$0(7619, 1529, 3, 5284, 5192, 75, $0_1 | 0, 0);
  $0_1 = $0(8);
  HEAP32[$0_1 + 4 >> 2] = 0;
  HEAP32[$0_1 >> 2] = 81;
  fimport$0(7619, 2104, 3, 5284, 5192, 75, $0_1 | 0, 0);
  $0_1 = $0(8);
  HEAP32[$0_1 + 4 >> 2] = 0;
  HEAP32[$0_1 >> 2] = 82;
  fimport$0(7619, 3429, 3, 5284, 5192, 75, $0_1 | 0, 0);
  $0_1 = $0(8);
  HEAP32[$0_1 + 4 >> 2] = 0;
  HEAP32[$0_1 >> 2] = 83;
  fimport$0(7619, 2684, 3, 5284, 5192, 75, $0_1 | 0, 0);
  $0_1 = $0(8);
  HEAP32[$0_1 + 4 >> 2] = 0;
  HEAP32[$0_1 >> 2] = 84;
  fimport$0(7619, 2453, 3, 5284, 5192, 75, $0_1 | 0, 0);
  $0_1 = $0(8);
  HEAP32[$0_1 + 4 >> 2] = 0;
  HEAP32[$0_1 >> 2] = 85;
  fimport$0(7619, 1333, 3, 5284, 5192, 75, $0_1 | 0, 0);
  $0_1 = $0(8);
  HEAP32[$0_1 + 4 >> 2] = 0;
  HEAP32[$0_1 >> 2] = 86;
  fimport$0(7619, 2744, 4, 5296, 5312, 77, $0_1 | 0, 0);
  $0_1 = $0(8);
  HEAP32[$0_1 + 4 >> 2] = 0;
  HEAP32[$0_1 >> 2] = 87;
  fimport$0(7619, 1691, 4, 5296, 5312, 77, $0_1 | 0, 0);
  $0_1 = $0(8);
  HEAP32[$0_1 + 4 >> 2] = 0;
  HEAP32[$0_1 >> 2] = 88;
  fimport$0(7619, 2541, 3, 5284, 5192, 75, $0_1 | 0, 0);
  $0_1 = $0(8);
  HEAP32[$0_1 + 4 >> 2] = 0;
  HEAP32[$0_1 >> 2] = 89;
  fimport$0(7619, 1220, 3, 5284, 5192, 75, $0_1 | 0, 0);
  $0_1 = $0(8);
  HEAP32[$0_1 + 4 >> 2] = 0;
  HEAP32[$0_1 >> 2] = 90;
  fimport$0(7619, 1137, 3, 5284, 5192, 75, $0_1 | 0, 0);
  $0_1 = $0(8);
  HEAP32[$0_1 + 4 >> 2] = 0;
  HEAP32[$0_1 >> 2] = 91;
  fimport$0(7619, 1159, 3, 5320, 5246, 92, $0_1 | 0, 0);
  $0_1 = $0(8);
  HEAP32[$0_1 + 4 >> 2] = 0;
  HEAP32[$0_1 >> 2] = 93;
  fimport$0(7619, 2132, 3, 5320, 5246, 92, $0_1 | 0, 0);
  $0_1 = $0(8);
  HEAP32[$0_1 + 4 >> 2] = 0;
  HEAP32[$0_1 >> 2] = 94;
  fimport$0(7619, 1638, 3, 5320, 5246, 92, $0_1 | 0, 0);
  $0_1 = $0(8);
  HEAP32[$0_1 + 4 >> 2] = 0;
  HEAP32[$0_1 >> 2] = 95;
  fimport$0(7619, 2508, 2, 5264, 4936, 71, $0_1 | 0, 0);
  $0_1 = $0(8);
  HEAP32[$0_1 + 4 >> 2] = 0;
  HEAP32[$0_1 >> 2] = 96;
  fimport$0(7619, 1196, 3, 5320, 5246, 92, $0_1 | 0, 0);
  $0_1 = $0(8);
  HEAP32[$0_1 + 4 >> 2] = 0;
  HEAP32[$0_1 >> 2] = 97;
  fimport$0(7619, 2847, 3, 5320, 5246, 92, $0_1 | 0, 0);
  $0_1 = $0(8);
  HEAP32[$0_1 + 4 >> 2] = 0;
  HEAP32[$0_1 >> 2] = 98;
  fimport$0(7619, 2977, 3, 5320, 5246, 92, $0_1 | 0, 0);
  $0_1 = $0(8);
  HEAP32[$0_1 + 4 >> 2] = 0;
  HEAP32[$0_1 >> 2] = 99;
  fimport$0(7619, 1727, 3, 5320, 5246, 92, $0_1 | 0, 0);
  $0_1 = $0(8);
  HEAP32[$0_1 + 4 >> 2] = 0;
  HEAP32[$0_1 >> 2] = 100;
  fimport$0(7619, 2555, 2, 5264, 4936, 71, $0_1 | 0, 0);
  $0_1 = $0(8);
  HEAP32[$0_1 + 4 >> 2] = 0;
  HEAP32[$0_1 >> 2] = 101;
  fimport$0(7619, 1937, 3, 5320, 5246, 92, $0_1 | 0, 0);
  $0_1 = $0(8);
  HEAP32[$0_1 + 4 >> 2] = 0;
  HEAP32[$0_1 >> 2] = 102;
  fimport$0(7619, 1601, 3, 5320, 5246, 92, $0_1 | 0, 0);
  $0_1 = $0(8);
  HEAP32[$0_1 + 4 >> 2] = 0;
  HEAP32[$0_1 >> 2] = 103;
  fimport$0(7619, 2494, 2, 5264, 4936, 71, $0_1 | 0, 0);
  $0_1 = $0(8);
  HEAP32[$0_1 + 4 >> 2] = 0;
  HEAP32[$0_1 >> 2] = 104;
  fimport$0(7619, 2995, 3, 5320, 5246, 92, $0_1 | 0, 0);
  $0_1 = $0(8);
  HEAP32[$0_1 + 4 >> 2] = 0;
  HEAP32[$0_1 >> 2] = 105;
  fimport$0(7619, 1743, 3, 5320, 5246, 92, $0_1 | 0, 0);
  $0_1 = $0(8);
  HEAP32[$0_1 + 4 >> 2] = 0;
  HEAP32[$0_1 >> 2] = 106;
  fimport$0(7619, 1957, 3, 5320, 5246, 92, $0_1 | 0, 0);
  $0_1 = $0(8);
  HEAP32[$0_1 + 4 >> 2] = 0;
  HEAP32[$0_1 >> 2] = 107;
  fimport$0(7619, 1618, 3, 5320, 5246, 92, $0_1 | 0, 0);
  $0_1 = $0(8);
  HEAP32[$0_1 + 4 >> 2] = 0;
  HEAP32[$0_1 >> 2] = 108;
  fimport$0(7619, 2953, 3, 5320, 5246, 92, $0_1 | 0, 0);
  $0_1 = $0(8);
  HEAP32[$0_1 + 4 >> 2] = 0;
  HEAP32[$0_1 >> 2] = 109;
  fimport$0(7619, 1708, 3, 5320, 5246, 92, $0_1 | 0, 0);
  $0_1 = $0(8);
  HEAP32[$0_1 + 4 >> 2] = 0;
  HEAP32[$0_1 >> 2] = 110;
  fimport$0(7619, 1911, 3, 5320, 5246, 92, $0_1 | 0, 0);
  $0_1 = $0(8);
  HEAP32[$0_1 + 4 >> 2] = 0;
  HEAP32[$0_1 >> 2] = 111;
  fimport$0(7619, 1581, 3, 5320, 5246, 92, $0_1 | 0, 0);
  $0_1 = $0(8);
  HEAP32[$0_1 + 4 >> 2] = 0;
  HEAP32[$0_1 >> 2] = 112;
  fimport$0(7619, 3197, 3, 5284, 5192, 75, $0_1 | 0, 0);
  $0_1 = $0(8);
  HEAP32[$0_1 + 4 >> 2] = 0;
  HEAP32[$0_1 >> 2] = 113;
  fimport$0(7619, 2610, 3, 5320, 5246, 92, $0_1 | 0, 0);
  $0_1 = $0(8);
  HEAP32[$0_1 + 4 >> 2] = 0;
  HEAP32[$0_1 >> 2] = 114;
  fimport$0(7619, 2324, 4, 5296, 5312, 77, $0_1 | 0, 0);
  $0_1 = $0(8);
  HEAP32[$0_1 + 4 >> 2] = 0;
  HEAP32[$0_1 >> 2] = 115;
  fimport$0(7619, 3278, 4, 5296, 5312, 77, $0_1 | 0, 0);
  $0_1 = $0(8);
  HEAP32[$0_1 + 4 >> 2] = 0;
  HEAP32[$0_1 >> 2] = 116;
  fimport$0(7619, 1762, 4, 5296, 5312, 77, $0_1 | 0, 0);
  $0_1 = $0(8);
  HEAP32[$0_1 + 4 >> 2] = 0;
  HEAP32[$0_1 >> 2] = 117;
  fimport$0(7619, 2477, 4, 5296, 5312, 77, $0_1 | 0, 0);
  $0_1 = $0(8);
  HEAP32[$0_1 + 4 >> 2] = 0;
  HEAP32[$0_1 >> 2] = 118;
  fimport$0(7619, 1658, 4, 5296, 5312, 77, $0_1 | 0, 0);
  $0_1 = $0(8);
  HEAP32[$0_1 + 4 >> 2] = 0;
  HEAP32[$0_1 >> 2] = 119;
  fimport$0(7619, 2718, 3, 5284, 5192, 75, $0_1 | 0, 0);
  $0_1 = $0(8);
  HEAP32[$0_1 + 4 >> 2] = 0;
  HEAP32[$0_1 >> 2] = 120;
  fimport$0(7619, 3503, 2, 5332, 4948, 121, $0_1 | 0, 0);
  $0_1 = $0(8);
  HEAP32[$0_1 + 4 >> 2] = 0;
  HEAP32[$0_1 >> 2] = 122;
  fimport$0(7619, 2652, 3, 5340, 5040, 123, $0_1 | 0, 0);
  $0_1 = $0(8);
  HEAP32[$0_1 + 4 >> 2] = 0;
  HEAP32[$0_1 >> 2] = 124;
  fimport$0(7619, 1545, 2, 5332, 4948, 121, $0_1 | 0, 0);
  $0_1 = $0(8);
  HEAP32[$0_1 + 4 >> 2] = 0;
  HEAP32[$0_1 >> 2] = 125;
  fimport$0(7619, 2118, 2, 5332, 4948, 121, $0_1 | 0, 0);
  $0_1 = $0(8);
  HEAP32[$0_1 + 4 >> 2] = 0;
  HEAP32[$0_1 >> 2] = 126;
  fimport$0(7619, 3442, 2, 5332, 4948, 121, $0_1 | 0, 0);
  $0_1 = $0(8);
  HEAP32[$0_1 + 4 >> 2] = 0;
  HEAP32[$0_1 >> 2] = 127;
  fimport$0(7619, 2701, 2, 5332, 4948, 121, $0_1 | 0, 0);
  $0_1 = $0(8);
  HEAP32[$0_1 + 4 >> 2] = 0;
  HEAP32[$0_1 >> 2] = 128;
  fimport$0(7619, 2465, 2, 5332, 4948, 121, $0_1 | 0, 0);
  $0_1 = $0(8);
  HEAP32[$0_1 + 4 >> 2] = 0;
  HEAP32[$0_1 >> 2] = 129;
  fimport$0(7619, 1351, 2, 5332, 4948, 121, $0_1 | 0, 0);
  $0_1 = $0(8);
  HEAP32[$0_1 + 4 >> 2] = 0;
  HEAP32[$0_1 >> 2] = 130;
  fimport$0(7619, 2754, 3, 5340, 5040, 123, $0_1 | 0, 0);
  $0_1 = $0(8);
  HEAP32[$0_1 + 4 >> 2] = 0;
  HEAP32[$0_1 >> 2] = 131;
  fimport$0(7619, 2145, 2, 5352, 4948, 132, $0_1 | 0, 0);
  $0_1 = $0(8);
  HEAP32[$0_1 + 4 >> 2] = 0;
  HEAP32[$0_1 >> 2] = 133;
  fimport$0(7619, 1208, 2, 5360, 5242, 134, $0_1 | 0, 0);
  $0_1 = $0(8);
  HEAP32[$0_1 + 4 >> 2] = 0;
  HEAP32[$0_1 >> 2] = 135;
  fimport$0(7619, 2861, 2, 5360, 5242, 134, $0_1 | 0, 0);
  $0_1 = $0(8);
  HEAP32[$0_1 + 4 >> 2] = 0;
  HEAP32[$0_1 >> 2] = 136;
  fimport$0(7619, 2986, 2, 5352, 4948, 132, $0_1 | 0, 0);
  $0_1 = $0(8);
  HEAP32[$0_1 + 4 >> 2] = 0;
  HEAP32[$0_1 >> 2] = 137;
  fimport$0(7619, 1947, 2, 5352, 4948, 132, $0_1 | 0, 0);
  $0_1 = $0(8);
  HEAP32[$0_1 + 4 >> 2] = 0;
  HEAP32[$0_1 >> 2] = 138;
  fimport$0(7619, 3007, 2, 5352, 4948, 132, $0_1 | 0, 0);
  $0_1 = $0(8);
  HEAP32[$0_1 + 4 >> 2] = 0;
  HEAP32[$0_1 >> 2] = 139;
  fimport$0(7619, 1970, 2, 5352, 4948, 132, $0_1 | 0, 0);
  $0_1 = $0(8);
  HEAP32[$0_1 + 4 >> 2] = 0;
  HEAP32[$0_1 >> 2] = 140;
  fimport$0(7619, 2965, 2, 5352, 4948, 132, $0_1 | 0, 0);
  $0_1 = $0(8);
  HEAP32[$0_1 + 4 >> 2] = 0;
  HEAP32[$0_1 >> 2] = 141;
  fimport$0(7619, 1924, 2, 5352, 4948, 132, $0_1 | 0, 0);
  $0_1 = $0(8);
  HEAP32[$0_1 + 4 >> 2] = 0;
  HEAP32[$0_1 >> 2] = 142;
  fimport$0(7619, 3210, 2, 5332, 4948, 121, $0_1 | 0, 0);
  $0_1 = $0(8);
  HEAP32[$0_1 + 4 >> 2] = 0;
  HEAP32[$0_1 >> 2] = 143;
  fimport$0(7619, 2625, 2, 5360, 5242, 134, $0_1 | 0, 0);
  $0_1 = $0(8);
  HEAP32[$0_1 + 4 >> 2] = 0;
  HEAP32[$0_1 >> 2] = 144;
  fimport$0(7619, 2334, 3, 5368, 5380, 145, $0_1 | 0, 0);
  $0_1 = $0(8);
  HEAP32[$0_1 + 4 >> 2] = 0;
  HEAP32[$0_1 >> 2] = 146;
  fimport$0(7619, 1232, 2, 5332, 4948, 121, $0_1 | 0, 0);
  $0_1 = $0(8);
  HEAP32[$0_1 + 4 >> 2] = 0;
  HEAP32[$0_1 >> 2] = 147;
  fimport$0(7619, 1148, 2, 5332, 4948, 121, $0_1 | 0, 0);
  $0_1 = $0(8);
  HEAP32[$0_1 + 4 >> 2] = 0;
  HEAP32[$0_1 >> 2] = 148;
  fimport$0(7619, 3289, 3, 5340, 5040, 123, $0_1 | 0, 0);
  $0_1 = $0(8);
  HEAP32[$0_1 + 4 >> 2] = 0;
  HEAP32[$0_1 >> 2] = 149;
  fimport$0(7619, 2484, 3, 5388, 5400, 150, $0_1 | 0, 0);
  $0_1 = $0(8);
  HEAP32[$0_1 + 4 >> 2] = 0;
  HEAP32[$0_1 >> 2] = 151;
  fimport$0(7619, 3591, 4, 5408, 5152, 152, $0_1 | 0, 0);
  $0_1 = $0(8);
  HEAP32[$0_1 + 4 >> 2] = 0;
  HEAP32[$0_1 >> 2] = 153;
  fimport$0(7619, 3612, 3, 5424, 5192, 154, $0_1 | 0, 0);
  $0_1 = $0(8);
  HEAP32[$0_1 + 4 >> 2] = 0;
  HEAP32[$0_1 >> 2] = 155;
  fimport$0(7619, 1306, 2, 5436, 4948, 156, $0_1 | 0, 0);
  $0_1 = $0(8);
  HEAP32[$0_1 + 4 >> 2] = 0;
  HEAP32[$0_1 >> 2] = 157;
  fimport$0(7619, 1561, 2, 5444, 4948, 158, $0_1 | 0, 0);
  $0_1 = $0(8);
  HEAP32[$0_1 + 4 >> 2] = 0;
  HEAP32[$0_1 >> 2] = 159;
  fimport$0(7619, 3603, 3, 5452, 5040, 160, $0_1 | 0, 0);
  $0_1 = $0(8);
  HEAP32[$0_1 + 4 >> 2] = 0;
  HEAP32[$0_1 >> 2] = 161;
  fimport$0(7619, 2875, 3, 5464, 5192, 162, $0_1 | 0, 0);
  $0_1 = $0(8);
  HEAP32[$0_1 + 4 >> 2] = 0;
  HEAP32[$0_1 >> 2] = 163;
  fimport$0(7619, 3519, 2, 5476, 4948, 164, $0_1 | 0, 0);
  $0_1 = $0(8);
  HEAP32[$0_1 + 4 >> 2] = 0;
  HEAP32[$0_1 >> 2] = 165;
  fimport$0(7619, 3539, 3, 5464, 5192, 162, $0_1 | 0, 0);
  $0_1 = $0(8);
  HEAP32[$0_1 + 4 >> 2] = 0;
  HEAP32[$0_1 >> 2] = 166;
  fimport$0(7619, 3752, 3, 5484, 5192, 167, $0_1 | 0, 0);
  $0_1 = $0(8);
  HEAP32[$0_1 + 4 >> 2] = 0;
  HEAP32[$0_1 >> 2] = 168;
  fimport$0(7619, 3750, 2, 5264, 4936, 71, $0_1 | 0, 0);
  $0_1 = $0(8);
  HEAP32[$0_1 + 4 >> 2] = 0;
  HEAP32[$0_1 >> 2] = 169;
  fimport$0(7619, 3769, 3, 5496, 5192, 170, $0_1 | 0, 0);
  $0_1 = $0(8);
  HEAP32[$0_1 + 4 >> 2] = 0;
  HEAP32[$0_1 >> 2] = 171;
  fimport$0(7619, 3767, 2, 5264, 4936, 71, $0_1 | 0, 0);
  $0_1 = $0(8);
  HEAP32[$0_1 + 4 >> 2] = 0;
  HEAP32[$0_1 >> 2] = 172;
  fimport$0(7619, 1119, 2, 5264, 4936, 71, $0_1 | 0, 0);
  $0_1 = $0(8);
  HEAP32[$0_1 + 4 >> 2] = 0;
  HEAP32[$0_1 >> 2] = 173;
  fimport$0(7619, 1111, 2, 5508, 4948, 174, $0_1 | 0, 0);
  $0_1 = $0(8);
  HEAP32[$0_1 + 4 >> 2] = 0;
  HEAP32[$0_1 >> 2] = 175;
  fimport$0(7619, 2782, 2, 5264, 4936, 71, $0_1 | 0, 0);
  $0_1 = $0(8);
  HEAP32[$0_1 + 4 >> 2] = 0;
  HEAP32[$0_1 >> 2] = 176;
  fimport$0(7619, 1244, 2, 5508, 4948, 174, $0_1 | 0, 0);
  $0_1 = $0(8);
  HEAP32[$0_1 + 4 >> 2] = 0;
  HEAP32[$0_1 >> 2] = 177;
  fimport$0(7619, 1257, 5, 5520, 5540, 178, $0_1 | 0, 0);
  $0_1 = $0(8);
  HEAP32[$0_1 + 4 >> 2] = 0;
  HEAP32[$0_1 >> 2] = 179;
  fimport$0(7619, 2023, 2, 5360, 5242, 134, $0_1 | 0, 0);
  $0_1 = $0(8);
  HEAP32[$0_1 + 4 >> 2] = 0;
  HEAP32[$0_1 >> 2] = 180;
  fimport$0(7619, 2001, 2, 5360, 5242, 134, $0_1 | 0, 0);
  $0_1 = $0(8);
  HEAP32[$0_1 + 4 >> 2] = 0;
  HEAP32[$0_1 >> 2] = 181;
  fimport$0(7619, 2438, 2, 5360, 5242, 134, $0_1 | 0, 0);
  $0_1 = $0(8);
  HEAP32[$0_1 + 4 >> 2] = 0;
  HEAP32[$0_1 >> 2] = 182;
  fimport$0(7619, 2808, 2, 5360, 5242, 134, $0_1 | 0, 0);
  $0_1 = $0(8);
  HEAP32[$0_1 + 4 >> 2] = 0;
  HEAP32[$0_1 >> 2] = 183;
  fimport$0(7619, 3019, 2, 5360, 5242, 134, $0_1 | 0, 0);
  $0_1 = $0(8);
  HEAP32[$0_1 + 4 >> 2] = 0;
  HEAP32[$0_1 >> 2] = 184;
  fimport$0(7619, 1983, 2, 5360, 5242, 134, $0_1 | 0, 0);
  $0_1 = $0(8);
  HEAP32[$0_1 + 4 >> 2] = 0;
  HEAP32[$0_1 >> 2] = 185;
  fimport$0(7619, 1273, 2, 5548, 4948, 186, $0_1 | 0, 0);
  $0_1 = $0(8);
  HEAP32[$0_1 + 4 >> 2] = 0;
  HEAP32[$0_1 >> 2] = 187;
  fimport$0(7619, 2764, 3, 5368, 5380, 145, $0_1 | 0, 0);
  $0_1 = $0(8);
  HEAP32[$0_1 + 4 >> 2] = 0;
  HEAP32[$0_1 >> 2] = 188;
  fimport$0(7619, 2344, 3, 5368, 5380, 145, $0_1 | 0, 0);
  $0_1 = $0(8);
  HEAP32[$0_1 + 4 >> 2] = 0;
  HEAP32[$0_1 >> 2] = 189;
  fimport$0(7619, 3300, 3, 5368, 5380, 145, $0_1 | 0, 0);
  $0_1 = $0(8);
  HEAP32[$0_1 + 4 >> 2] = 0;
  HEAP32[$0_1 >> 2] = 190;
  fimport$0(7619, 2731, 2, 5332, 4948, 121, $0_1 | 0, 0);
 }
 
 function $127($0_1) {
  var $1_1 = 0;
  $1_1 = HEAP32[$0_1 + 72 >> 2];
  HEAP32[$0_1 + 72 >> 2] = $1_1 - 1 | $1_1;
  $1_1 = HEAP32[$0_1 >> 2];
  if ($1_1 & 8) {
   HEAP32[$0_1 >> 2] = $1_1 | 32;
   return -1;
  }
  HEAP32[$0_1 + 4 >> 2] = 0;
  HEAP32[$0_1 + 8 >> 2] = 0;
  $1_1 = HEAP32[$0_1 + 44 >> 2];
  HEAP32[$0_1 + 28 >> 2] = $1_1;
  HEAP32[$0_1 + 20 >> 2] = $1_1;
  HEAP32[$0_1 + 16 >> 2] = $1_1 + HEAP32[$0_1 + 48 >> 2];
  return 0;
 }
 
 function $128($0_1, $1_1) {
  var $2_1 = 0;
  block : {
   if ($1_1 >>> 0 <= 3) {
    $0_1 = (($1_1 << 2) + $0_1 | 0) + 4 | 0
   } else {
    $2_1 = HEAP32[$0_1 + 24 >> 2];
    $0_1 = HEAP32[$2_1 >> 2];
    $1_1 = $1_1 - 4 | 0;
    if ($1_1 >>> 0 >= HEAP32[$2_1 + 4 >> 2] - $0_1 >> 2 >>> 0) {
     break block
    }
    $0_1 = $0_1 + ($1_1 << 2) | 0;
   }
   return HEAP32[$0_1 >> 2];
  }
  fimport$2();
  wasm2js_trap();
 }
 
 function $129($0_1, $1_1) {
  var $2_1 = 0;
  if (($1_1 | 0) < 0) {
   fimport$2();
   wasm2js_trap();
  }
  $1_1 = ($1_1 - 1 >>> 5 | 0) + 1 | 0;
  $2_1 = $0($1_1 << 2);
  HEAP32[$0_1 + 8 >> 2] = $1_1;
  HEAP32[$0_1 + 4 >> 2] = 0;
  HEAP32[$0_1 >> 2] = $2_1;
 }
 
 function $130($0_1, $1_1) {
  var $2_1 = 0, $3_1 = 0, $4_1 = 0, $5_1 = 0, $6_1 = 0, $7_1 = 0, $8_1 = 0, $9 = 0, $10_1 = 0;
  HEAP16[$0_1 >> 1] = HEAPU16[$1_1 >> 1];
  $2_1 = HEAP32[$1_1 + 8 >> 2];
  HEAP32[$0_1 + 4 >> 2] = HEAP32[$1_1 + 4 >> 2];
  HEAP32[$0_1 + 8 >> 2] = $2_1;
  $2_1 = HEAP32[$1_1 + 16 >> 2];
  HEAP32[$0_1 + 12 >> 2] = HEAP32[$1_1 + 12 >> 2];
  HEAP32[$0_1 + 16 >> 2] = $2_1;
  HEAP32[$0_1 + 20 >> 2] = HEAP32[$1_1 + 20 >> 2];
  block1 : {
   $3_1 = HEAP32[$1_1 + 24 >> 2];
   block : {
    if (!$3_1) {
     break block
    }
    $4_1 = $0(24);
    HEAP32[$4_1 + 8 >> 2] = 0;
    HEAP32[$4_1 >> 2] = 0;
    HEAP32[$4_1 + 4 >> 2] = 0;
    $1_1 = HEAP32[$3_1 + 4 >> 2];
    $2_1 = HEAP32[$3_1 >> 2];
    if (($1_1 | 0) != ($2_1 | 0)) {
     $2_1 = $1_1 - $2_1 | 0;
     if (($2_1 | 0) < 0) {
      break block1
     }
     $1_1 = $0($2_1);
     HEAP32[$4_1 >> 2] = $1_1;
     HEAP32[$4_1 + 8 >> 2] = $1_1 + $2_1;
     $2_1 = HEAP32[$3_1 >> 2];
     $6_1 = HEAP32[$3_1 + 4 >> 2];
     if (($2_1 | 0) != ($6_1 | 0)) {
      while (1) {
       HEAP32[$1_1 >> 2] = HEAP32[$2_1 >> 2];
       $1_1 = $1_1 + 4 | 0;
       $2_1 = $2_1 + 4 | 0;
       if (($6_1 | 0) != ($2_1 | 0)) {
        continue
       }
       break;
      }
     }
     HEAP32[$4_1 + 4 >> 2] = $1_1;
    }
    HEAP32[$4_1 + 12 >> 2] = 0;
    HEAP32[$4_1 + 16 >> 2] = 0;
    HEAP32[$4_1 + 20 >> 2] = 0;
    $1_1 = HEAP32[$3_1 + 16 >> 2];
    if (!$1_1) {
     break block
    }
    $129($4_1 + 12 | 0, $1_1);
    $6_1 = HEAP32[$3_1 + 12 >> 2];
    $2_1 = HEAP32[$3_1 + 16 >> 2];
    $3_1 = HEAP32[$4_1 + 16 >> 2];
    $1_1 = (($2_1 & 31) + $3_1 | 0) + ($2_1 & -32) | 0;
    HEAP32[$4_1 + 16 >> 2] = $1_1;
    block3 : {
     block2 : {
      if (!$3_1) {
       $5_1 = $1_1 - 1 | 0;
       break block2;
      }
      $5_1 = $1_1 - 1 | 0;
      if (($5_1 ^ $3_1 - 1) >>> 0 < 32) {
       break block3
      }
     }
     HEAP32[HEAP32[$4_1 + 12 >> 2] + (($1_1 >>> 0 >= 33 ? $5_1 >>> 5 | 0 : 0) << 2) >> 2] = 0;
    }
    $1_1 = HEAP32[$4_1 + 12 >> 2] + ($3_1 >>> 3 & 536870908) | 0;
    $3_1 = $3_1 & 31;
    if (!$3_1) {
     if (($2_1 | 0) <= 0) {
      break block
     }
     $3_1 = ($2_1 | 0) / 32 | 0;
     if ($2_1 + 31 >>> 0 >= 63) {
      $21($1_1, $6_1, $3_1 << 2)
     }
     $2_1 = $2_1 - ($3_1 << 5) | 0;
     if (($2_1 | 0) <= 0) {
      break block
     }
     $5_1 = $1_1;
     $1_1 = $3_1 << 2;
     $3_1 = $5_1 + $1_1 | 0;
     $2_1 = -1 >>> 32 - $2_1 | 0;
     HEAP32[$3_1 >> 2] = HEAP32[$3_1 >> 2] & ($2_1 ^ -1) | $2_1 & HEAP32[$1_1 + $6_1 >> 2];
     break block;
    }
    if (($2_1 | 0) <= 0) {
     break block
    }
    $8_1 = -1 << $3_1;
    $5_1 = 32 - $3_1 | 0;
    if (($2_1 | 0) >= 32) {
     $10_1 = $8_1 ^ -1;
     $7_1 = HEAP32[$1_1 >> 2];
     while (1) {
      $9 = $7_1 & $10_1;
      $7_1 = HEAP32[$6_1 >> 2];
      HEAP32[$1_1 >> 2] = $9 | $7_1 << $3_1;
      $7_1 = HEAP32[$1_1 + 4 >> 2] & $8_1 | $7_1 >>> $5_1;
      HEAP32[$1_1 + 4 >> 2] = $7_1;
      $6_1 = $6_1 + 4 | 0;
      $1_1 = $1_1 + 4 | 0;
      $9 = $2_1 >>> 0 > 63;
      $2_1 = $2_1 - 32 | 0;
      if ($9) {
       continue
      }
      break;
     };
     if (($2_1 | 0) <= 0) {
      break block
     }
    }
    $7_1 = $5_1;
    $5_1 = ($2_1 | 0) > ($5_1 | 0) ? $5_1 : $2_1;
    $6_1 = HEAP32[$6_1 >> 2] & -1 >>> 32 - $2_1;
    HEAP32[$1_1 >> 2] = HEAP32[$1_1 >> 2] & (-1 >>> $7_1 - $5_1 & $8_1 ^ -1) | $6_1 << $3_1;
    $2_1 = $2_1 - $5_1 | 0;
    if (($2_1 | 0) <= 0) {
     break block
    }
    $1_1 = ($3_1 + $5_1 >>> 3 & 536870908) + $1_1 | 0;
    HEAP32[$1_1 >> 2] = HEAP32[$1_1 >> 2] & (-1 >>> 32 - $2_1 ^ -1) | $6_1 >>> $5_1;
   }
   $1_1 = HEAP32[$0_1 + 24 >> 2];
   HEAP32[$0_1 + 24 >> 2] = $4_1;
   if ($1_1) {
    $61($1_1)
   }
   return;
  }
  fimport$2();
  wasm2js_trap();
 }
 
 function $131($0_1) {
  $0_1 = $0_1 | 0;
  var $1_1 = 0, $2_1 = 0, $3_1 = 0, $4_1 = 0, $5_1 = 0, $6_1 = 0, $7_1 = 0;
  if ($0_1) {
   $6_1 = global$0 - 32 | 0;
   global$0 = $6_1;
   $1_1 = HEAP32[$0_1 >> 2];
   $3_1 = HEAP32[$1_1 + 484 >> 2];
   if ($3_1) {
    $81($3_1, $1_1);
    HEAP32[$1_1 + 484 >> 2] = 0;
   }
   $3_1 = HEAP32[$1_1 + 488 >> 2];
   $2_1 = HEAP32[$1_1 + 492 >> 2];
   if (($3_1 | 0) != ($2_1 | 0)) {
    $2_1 = $2_1 - $3_1 >> 2;
    $4_1 = $2_1 >>> 0 <= 1 ? 1 : $2_1;
    $2_1 = 0;
    while (1) {
     HEAP32[HEAP32[($2_1 << 2) + $3_1 >> 2] + 484 >> 2] = 0;
     $2_1 = $2_1 + 1 | 0;
     if (($4_1 | 0) != ($2_1 | 0)) {
      continue
     }
     break;
    };
   }
   HEAP32[$1_1 + 492 >> 2] = $3_1;
   $2_1 = $1_1 + 496 | 0;
   block : {
    if (HEAP32[$2_1 >> 2] == ($3_1 | 0)) {
     break block
    }
    $2_1 = $44($6_1 + 8 | 0, 0, 0, $2_1);
    $4_1 = HEAP32[$1_1 + 488 >> 2];
    $5_1 = HEAP32[$1_1 + 492 >> 2] - $4_1 | 0;
    $3_1 = HEAP32[$2_1 + 4 >> 2] - $5_1 | 0;
    $5_1 = $21($3_1, $4_1, $5_1);
    $4_1 = HEAP32[$1_1 + 488 >> 2];
    HEAP32[$1_1 + 488 >> 2] = $5_1;
    HEAP32[$2_1 + 4 >> 2] = $4_1;
    $5_1 = HEAP32[$1_1 + 492 >> 2];
    HEAP32[$1_1 + 492 >> 2] = HEAP32[$2_1 + 8 >> 2];
    HEAP32[$2_1 + 8 >> 2] = $5_1;
    $7_1 = HEAP32[$1_1 + 496 >> 2];
    HEAP32[$1_1 + 496 >> 2] = HEAP32[$2_1 + 12 >> 2];
    HEAP32[$2_1 >> 2] = $4_1;
    HEAP32[$2_1 + 12 >> 2] = $7_1;
    if (($4_1 | 0) != ($5_1 | 0)) {
     HEAP32[$2_1 + 8 >> 2] = $5_1 + (($4_1 - $5_1 | 0) + 3 & -4)
    }
    if (!$4_1) {
     break block
    }
    $5($4_1);
    $3_1 = HEAP32[$1_1 + 488 >> 2];
   }
   if ($3_1) {
    HEAP32[$1_1 + 492 >> 2] = $3_1;
    $5($3_1);
   }
   $3_1 = HEAP32[$1_1 + 148 >> 2];
   HEAP32[$1_1 + 148 >> 2] = 0;
   if ($3_1) {
    $61($3_1)
   }
   $5($1_1);
   $1_1 = HEAP32[$0_1 + 8 >> 2];
   HEAP32[$0_1 + 8 >> 2] = 0;
   if ($1_1) {
    FUNCTION_TABLE[HEAP32[HEAP32[$1_1 >> 2] + 4 >> 2]]($1_1)
   }
   $1_1 = HEAP32[$0_1 + 4 >> 2];
   HEAP32[$0_1 + 4 >> 2] = 0;
   if ($1_1) {
    FUNCTION_TABLE[HEAP32[HEAP32[$1_1 >> 2] + 4 >> 2]]($1_1)
   }
   global$0 = $6_1 + 32 | 0;
   $5($0_1);
  }
 }
 
 function $132($0_1, $1_1) {
  var $2_1 = 0, $3_1 = 0;
  $2_1 = global$0 - 16 | 0;
  global$0 = $2_1;
  block : {
   if ($1_1) {
    $1_1 = HEAP32[$1_1 >> 2];
    $3_1 = $62($0(520), $1_1);
    if ($1_1) {
     break block
    }
    HEAP32[$2_1 >> 2] = 3319;
    $84($2_1);
    $6();
    wasm2js_trap();
   }
   if (!HEAPU8[7572]) {
    HEAP32[1886] = 3;
    HEAP32[1890] = 0;
    HEAP32[1891] = 1065353216;
    HEAP32[1888] = 0;
    HEAP32[1889] = 0;
    HEAP8[7572] = 1;
    HEAP8[7548] = HEAPU8[7548] & 254;
    HEAP32[1885] = 0;
    HEAP32[1892] = 0;
   }
   $3_1 = $62($0(520), 7540);
  }
  $1_1 = $3_1;
  HEAP32[$0_1 + 4 >> 2] = 0;
  HEAP32[$0_1 + 8 >> 2] = 0;
  HEAP32[$0_1 >> 2] = $1_1;
  HEAP32[$1_1 + 4 >> 2] = $0_1;
  global$0 = $2_1 + 16 | 0;
  return $0_1;
 }
 
 function $133($0_1) {
  $0_1 = $0_1 | 0;
  var $1_1 = 0;
  if ($0_1) {
   $1_1 = HEAP32[$0_1 >> 2];
   if ($1_1) {
    $5($1_1)
   }
   $5($0_1);
  }
 }
 
 function $134() {
  var $0_1 = 0, $1_1 = 0;
  $1_1 = $0(4);
  $0_1 = $0(32);
  HEAP32[$0_1 + 28 >> 2] = 0;
  HEAP32[$0_1 + 20 >> 2] = 0;
  HEAP32[$0_1 + 24 >> 2] = 1065353216;
  HEAP32[$0_1 + 12 >> 2] = 0;
  HEAP32[$0_1 + 16 >> 2] = 0;
  HEAP8[$0_1 + 8 | 0] = 0;
  HEAP32[$0_1 + 4 >> 2] = 3;
  HEAP32[$0_1 >> 2] = 0;
  HEAP32[$1_1 >> 2] = $0_1;
  return $1_1 | 0;
 }
 
 function $135($0_1, $1_1, $2_1, $3_1, $4_1) {
  $0_1 = $0_1 | 0;
  $1_1 = $1_1 | 0;
  $2_1 = $2_1 | 0;
  $3_1 = $3_1 | 0;
  $4_1 = $4_1 | 0;
  if (!($2_1 ? ($2_1 | 0) != 5 : 0)) {
   return $43(6200, $3_1, $4_1) | 0
  }
  return $82($3_1, $4_1) | 0;
 }
 
 function $136($0_1, $1_1, $2_1, $3_1, $4_1) {
  $0_1 = $0_1 | 0;
  $1_1 = $1_1 | 0;
  $2_1 = $2_1 | 0;
  $3_1 = $3_1 | 0;
  $4_1 = $4_1 | 0;
  return FUNCTION_TABLE[$0_1 | 0]($1_1, $2_1, $3_1, $4_1) | 0;
 }
 
 function $137($0_1, $1_1, $2_1) {
  $0_1 = $0_1 | 0;
  $1_1 = $1_1 | 0;
  $2_1 = $2_1 | 0;
  var $3_1 = 0, $4_1 = 0, $5_1 = 0, $6_1 = 0, $7_1 = 0;
  $4_1 = HEAP32[$0_1 + 84 >> 2];
  $5_1 = HEAP32[$4_1 >> 2];
  $3_1 = HEAP32[$4_1 + 4 >> 2];
  $7_1 = HEAP32[$0_1 + 28 >> 2];
  $6_1 = HEAP32[$0_1 + 20 >> 2] - $7_1 | 0;
  $6_1 = $3_1 >>> 0 < $6_1 >>> 0 ? $3_1 : $6_1;
  if ($6_1) {
   $13($5_1, $7_1, $6_1);
   $5_1 = $6_1 + HEAP32[$4_1 >> 2] | 0;
   HEAP32[$4_1 >> 2] = $5_1;
   $3_1 = HEAP32[$4_1 + 4 >> 2] - $6_1 | 0;
   HEAP32[$4_1 + 4 >> 2] = $3_1;
  }
  $3_1 = $2_1 >>> 0 > $3_1 >>> 0 ? $3_1 : $2_1;
  if ($3_1) {
   $13($5_1, $1_1, $3_1);
   $5_1 = $3_1 + HEAP32[$4_1 >> 2] | 0;
   HEAP32[$4_1 >> 2] = $5_1;
   HEAP32[$4_1 + 4 >> 2] = HEAP32[$4_1 + 4 >> 2] - $3_1;
  }
  HEAP8[$5_1 | 0] = 0;
  $1_1 = HEAP32[$0_1 + 44 >> 2];
  HEAP32[$0_1 + 28 >> 2] = $1_1;
  HEAP32[$0_1 + 20 >> 2] = $1_1;
  return $2_1 | 0;
 }
 
 function $138($0_1, $1_1, $2_1, $3_1) {
  $0_1 = $0_1 | 0;
  $1_1 = $1_1 | 0;
  $2_1 = $2_1 | 0;
  $3_1 = $3_1 | 0;
  i64toi32_i32$HIGH_BITS = 0;
  return 0;
 }
 
 function $139($0_1) {
  $0_1 = $0_1 | 0;
  return 0;
 }
 
 function $140($0_1, $1_1) {
  $0_1 = $0_1 | 0;
  $1_1 = $1_1 | 0;
  var $2_1 = 0, $3_1 = 0, $4_1 = 0, $5_1 = 0, $6_1 = 0, $7_1 = 0, $8_1 = 0, $9 = 0, $10_1 = 0, $11_1 = 0, $12_1 = 0, $13_1 = 0, $14_1 = 0, $15_1 = 0, wasm2js_i32$0 = 0, wasm2js_f64$0 = 0.0;
  $2_1 = $1_1;
  $1_1 = HEAP32[$1_1 >> 2] + 7 & -8;
  HEAP32[$2_1 >> 2] = $1_1 + 16;
  $15_1 = $0_1;
  $0_1 = $1_1;
  $8_1 = HEAP32[$0_1 >> 2];
  $3_1 = HEAP32[$0_1 + 4 >> 2];
  $2_1 = HEAP32[$0_1 + 8 >> 2];
  $0_1 = HEAP32[$0_1 + 12 >> 2];
  $13_1 = $0_1;
  $6_1 = global$0 - 32 | 0;
  global$0 = $6_1;
  $0_1 = $0_1 & 2147483647;
  $7_1 = $0_1;
  $1_1 = $2_1;
  $4_1 = $0_1 - 1006698496 | 0;
  $0_1 = $0_1 - 1140785152 | 0;
  block : {
   if (0 | $0_1 >>> 0 > $4_1 >>> 0) {
    $0_1 = $1_1;
    $2_1 = $13_1 << 4 | $0_1 >>> 28;
    $1_1 = $0_1 << 4 | $3_1 >>> 28;
    $0_1 = $2_1;
    $3_1 = $3_1 & 268435455;
    if (($3_1 | 0) == 134217728 & ($8_1 | 0) != 0 | $3_1 >>> 0 > 134217728) {
     $0_1 = $0_1 + 1073741824 | 0;
     $1_1 = $1_1 + 1 | 0;
     $0_1 = $1_1 ? $0_1 : $0_1 + 1 | 0;
     break block;
    }
    $0_1 = $0_1 + 1073741824 | 0;
    if ($8_1 | ($3_1 | 0) != 134217728) {
     break block
    }
    $3_1 = $1_1 & 1;
    $1_1 = $3_1 + $1_1 | 0;
    $0_1 = $1_1 >>> 0 < $3_1 >>> 0 ? $0_1 + 1 | 0 : $0_1;
    break block;
   }
   if (!(!$1_1 & ($7_1 | 0) == 2147418112 ? !($3_1 | $8_1) : $7_1 >>> 0 < 2147418112)) {
    $0_1 = $2_1;
    $2_1 = $13_1 << 4 | $0_1 >>> 28;
    $1_1 = $0_1 << 4 | $3_1 >>> 28;
    $0_1 = $2_1 & 524287 | 2146959360;
    break block;
   }
   $1_1 = 0;
   $0_1 = 2146435072;
   if ($7_1 >>> 0 > 1140785151) {
    break block
   }
   $0_1 = 0;
   $14_1 = $7_1 >>> 16 | 0;
   if ($14_1 >>> 0 < 15249) {
    break block
   }
   $1_1 = $8_1;
   $0_1 = $3_1;
   $4_1 = $13_1 & 65535 | 65536;
   $7_1 = $4_1;
   $11_1 = $2_1;
   $5_1 = $2_1;
   $10_1 = $14_1 - 15233 | 0;
   block1 : {
    if ($10_1 & 64) {
     $4_1 = $1_1;
     $0_1 = $10_1 + -64 | 0;
     $2_1 = $0_1 & 31;
     if (($0_1 & 63) >>> 0 >= 32) {
      $0_1 = $1_1 << $2_1;
      $5_1 = 0;
     } else {
      $0_1 = (1 << $2_1) - 1 & $4_1 >>> 32 - $2_1 | $3_1 << $2_1;
      $5_1 = $4_1 << $2_1;
     }
     $4_1 = $0_1;
     $1_1 = 0;
     $0_1 = 0;
     break block1;
    }
    if (!$10_1) {
     break block1
    }
    $12_1 = $5_1;
    $9 = $10_1 & 31;
    if (($10_1 & 63) >>> 0 >= 32) {
     $2_1 = $5_1 << $9;
     $5_1 = 0;
    } else {
     $2_1 = (1 << $9) - 1 & $12_1 >>> 32 - $9 | $4_1 << $9;
     $5_1 = $12_1 << $9;
    }
    $4_1 = $2_1;
    $12_1 = $5_1;
    $9 = $1_1;
    $2_1 = 64 - $10_1 | 0;
    $5_1 = $2_1 & 31;
    if (($2_1 & 63) >>> 0 >= 32) {
     $2_1 = 0;
     $5_1 = $0_1 >>> $5_1 | 0;
    } else {
     $2_1 = $0_1 >>> $5_1 | 0;
     $5_1 = ((1 << $5_1) - 1 & $0_1) << 32 - $5_1 | $9 >>> $5_1;
    }
    $5_1 = $12_1 | $5_1;
    $4_1 = $2_1 | $4_1;
    $12_1 = $1_1;
    $9 = $10_1 & 31;
    if (($10_1 & 63) >>> 0 >= 32) {
     $2_1 = $1_1 << $9;
     $1_1 = 0;
    } else {
     $2_1 = (1 << $9) - 1 & $12_1 >>> 32 - $9 | $0_1 << $9;
     $1_1 = $12_1 << $9;
    }
    $0_1 = $2_1;
   }
   HEAP32[$6_1 + 16 >> 2] = $1_1;
   HEAP32[$6_1 + 20 >> 2] = $0_1;
   HEAP32[$6_1 + 24 >> 2] = $5_1;
   HEAP32[$6_1 + 28 >> 2] = $4_1;
   $1_1 = 15361 - $14_1 | 0;
   block2 : {
    if ($1_1 & 64) {
     $3_1 = $11_1;
     $1_1 = $1_1 + -64 | 0;
     $0_1 = $1_1 & 31;
     if (($1_1 & 63) >>> 0 >= 32) {
      $2_1 = 0;
      $8_1 = $7_1 >>> $0_1 | 0;
     } else {
      $2_1 = $7_1 >>> $0_1 | 0;
      $8_1 = ((1 << $0_1) - 1 & $7_1) << 32 - $0_1 | $3_1 >>> $0_1;
     }
     $3_1 = $2_1;
     $11_1 = 0;
     $7_1 = 0;
     break block2;
    }
    if (!$1_1) {
     break block2
    }
    $4_1 = $11_1;
    $0_1 = 64 - $1_1 | 0;
    $2_1 = $0_1 & 31;
    if (($0_1 & 63) >>> 0 >= 32) {
     $0_1 = $4_1 << $2_1;
     $5_1 = 0;
    } else {
     $0_1 = (1 << $2_1) - 1 & $4_1 >>> 32 - $2_1 | $7_1 << $2_1;
     $5_1 = $4_1 << $2_1;
    }
    $4_1 = $8_1;
    $8_1 = $1_1 & 31;
    if (($1_1 & 63) >>> 0 >= 32) {
     $2_1 = 0;
     $4_1 = $3_1 >>> $8_1 | 0;
    } else {
     $2_1 = $3_1 >>> $8_1 | 0;
     $4_1 = ((1 << $8_1) - 1 & $3_1) << 32 - $8_1 | $4_1 >>> $8_1;
    }
    $8_1 = $5_1 | $4_1;
    $3_1 = $0_1 | $2_1;
    $4_1 = $11_1;
    $2_1 = $1_1 & 31;
    if (($1_1 & 63) >>> 0 >= 32) {
     $0_1 = 0;
     $11_1 = $7_1 >>> $2_1 | 0;
    } else {
     $0_1 = $7_1 >>> $2_1 | 0;
     $11_1 = ((1 << $2_1) - 1 & $7_1) << 32 - $2_1 | $4_1 >>> $2_1;
    }
    $7_1 = $0_1;
   }
   HEAP32[$6_1 >> 2] = $8_1;
   HEAP32[$6_1 + 4 >> 2] = $3_1;
   HEAP32[$6_1 + 8 >> 2] = $11_1;
   HEAP32[$6_1 + 12 >> 2] = $7_1;
   $1_1 = HEAP32[$6_1 + 8 >> 2];
   $0_1 = HEAP32[$6_1 + 12 >> 2] << 4 | $1_1 >>> 28;
   $1_1 = $1_1 << 4;
   $2_1 = HEAP32[$6_1 >> 2];
   $7_1 = HEAP32[$6_1 + 4 >> 2];
   $1_1 = $7_1 >>> 28 | $1_1;
   $3_1 = $7_1 & 268435455;
   $2_1 = $2_1 | (HEAP32[$6_1 + 16 >> 2] | HEAP32[$6_1 + 24 >> 2] | (HEAP32[$6_1 + 20 >> 2] | HEAP32[$6_1 + 28 >> 2])) != 0;
   if (($3_1 | 0) == 134217728 & ($2_1 | 0) != 0 | $3_1 >>> 0 > 134217728) {
    $1_1 = $1_1 + 1 | 0;
    $0_1 = $1_1 ? $0_1 : $0_1 + 1 | 0;
    break block;
   }
   if ($2_1 | ($3_1 | 0) != 134217728) {
    break block
   }
   $2_1 = $1_1;
   $1_1 = $1_1 + ($1_1 & 1) | 0;
   $0_1 = $2_1 >>> 0 > $1_1 >>> 0 ? $0_1 + 1 | 0 : $0_1;
  }
  global$0 = $6_1 + 32 | 0;
  wasm2js_scratch_store_i32(0, $1_1 | 0);
  wasm2js_scratch_store_i32(1, $13_1 & -2147483648 | $0_1);
  (wasm2js_i32$0 = $15_1, wasm2js_f64$0 = +wasm2js_scratch_load_f64()), HEAPF64[wasm2js_i32$0 >> 3] = wasm2js_f64$0;
 }
 
 function $141($0_1, $1_1, $2_1, $3_1, $4_1, $5_1) {
  $0_1 = $0_1 | 0;
  $1_1 = +$1_1;
  $2_1 = $2_1 | 0;
  $3_1 = $3_1 | 0;
  $4_1 = $4_1 | 0;
  $5_1 = $5_1 | 0;
  var $6_1 = 0, $7_1 = 0, $8_1 = 0, $9 = 0, $10_1 = 0, $11_1 = 0, $12_1 = 0, $13_1 = 0, $14_1 = 0, $15_1 = 0, $16_1 = 0, $17_1 = 0, $18_1 = 0.0, $19_1 = 0, $20_1 = 0, $21_1 = 0, $22_1 = 0, $23_1 = 0, $24_1 = 0, wasm2js_i32$0 = 0, wasm2js_i32$1 = 0;
  $11_1 = global$0 - 560 | 0;
  global$0 = $11_1;
  HEAP32[$11_1 + 44 >> 2] = 0;
  wasm2js_scratch_store_f64(+$1_1);
  $6_1 = wasm2js_scratch_load_i32(1) | 0;
  wasm2js_scratch_load_i32(0) | 0;
  block : {
   if (($6_1 | 0) < 0) {
    $19_1 = 1;
    $22_1 = 1177;
    $1_1 = -$1_1;
    wasm2js_scratch_store_f64(+$1_1);
    $6_1 = wasm2js_scratch_load_i32(1) | 0;
    wasm2js_scratch_load_i32(0) | 0;
    break block;
   }
   if ($4_1 & 2048) {
    $19_1 = 1;
    $22_1 = 1180;
    break block;
   }
   $19_1 = $4_1 & 1;
   $22_1 = $19_1 ? 1183 : 1178;
   $24_1 = !$19_1;
  }
  block1 : {
   if (($6_1 & 2146435072) == 2146435072) {
    $3_1 = $19_1 + 3 | 0;
    $11($0_1, 32, $2_1, $3_1, $4_1 & -65537);
    $8($0_1, $22_1, $19_1);
    $5_1 = $5_1 & 32;
    $8($0_1, $1_1 != $1_1 ? ($5_1 ? 2797 : 3932) : $5_1 ? 3425 : 3936, 3);
    $11($0_1, 32, $2_1, $3_1, $4_1 ^ 8192);
    $8_1 = ($2_1 | 0) < ($3_1 | 0) ? $3_1 : $2_1;
    break block1;
   }
   $20_1 = $11_1 + 16 | 0;
   block3 : {
    block4 : {
     block2 : {
      $1_1 = $110($1_1, $11_1 + 44 | 0);
      $1_1 = $1_1 + $1_1;
      if ($1_1 != 0.0) {
       $6_1 = HEAP32[$11_1 + 44 >> 2];
       HEAP32[$11_1 + 44 >> 2] = $6_1 - 1;
       $16_1 = $5_1 | 32;
       if (($16_1 | 0) != 97) {
        break block2
       }
       break block3;
      }
      $16_1 = $5_1 | 32;
      if (($16_1 | 0) == 97) {
       break block3
      }
      $10_1 = HEAP32[$11_1 + 44 >> 2];
      break block4;
     }
     $10_1 = $6_1 - 29 | 0;
     HEAP32[$11_1 + 44 >> 2] = $10_1;
     $1_1 = $1_1 * 268435456.0;
    }
    $12_1 = ($3_1 | 0) < 0 ? 6 : $3_1;
    $13_1 = ($11_1 + 48 | 0) + (($10_1 | 0) >= 0 ? 288 : 0) | 0;
    $7_1 = $13_1;
    while (1) {
     $3_1 = $1_1 < 4294967296.0 & $1_1 >= 0.0 ? ~~$1_1 >>> 0 : 0;
     HEAP32[$7_1 >> 2] = $3_1;
     $7_1 = $7_1 + 4 | 0;
     $1_1 = ($1_1 - +($3_1 >>> 0)) * 1.0e9;
     if ($1_1 != 0.0) {
      continue
     }
     break;
    };
    block6 : {
     if (($10_1 | 0) <= 0) {
      $3_1 = $10_1;
      $6_1 = $7_1;
      $9 = $13_1;
      break block6;
     }
     $9 = $13_1;
     $3_1 = $10_1;
     while (1) {
      $15_1 = ($3_1 | 0) >= 29 ? 29 : $3_1;
      $6_1 = $7_1 - 4 | 0;
      block7 : {
       if ($9 >>> 0 > $6_1 >>> 0) {
        break block7
       }
       $3_1 = 0;
       while (1) {
        $14_1 = HEAP32[$6_1 >> 2];
        $8_1 = $15_1 & 31;
        $21_1 = $3_1;
        if (($15_1 & 63) >>> 0 >= 32) {
         $3_1 = $14_1 << $8_1;
         $14_1 = 0;
        } else {
         $3_1 = (1 << $8_1) - 1 & $14_1 >>> 32 - $8_1;
         $14_1 = $14_1 << $8_1;
        }
        $8_1 = $21_1 + $14_1 | 0;
        $3_1 = _ZN17compiler_builtins3int4udiv10divmod_u6417h6026910b5ed08e40E($8_1, $8_1 >>> 0 < $14_1 >>> 0 ? $3_1 + 1 | 0 : $3_1, 1e9);
        (wasm2js_i32$0 = $6_1, wasm2js_i32$1 = __wasm_i64_mul($3_1, i64toi32_i32$HIGH_BITS, -1e9, 0) + $8_1 | 0), HEAP32[wasm2js_i32$0 >> 2] = wasm2js_i32$1;
        $6_1 = $6_1 - 4 | 0;
        if ($9 >>> 0 <= $6_1 >>> 0) {
         continue
        }
        break;
       };
       if (!$3_1) {
        break block7
       }
       $9 = $9 - 4 | 0;
       HEAP32[$9 >> 2] = $3_1;
      }
      while (1) {
       $6_1 = $7_1;
       if ($9 >>> 0 < $6_1 >>> 0) {
        $7_1 = $6_1 - 4 | 0;
        if (!HEAP32[$7_1 >> 2]) {
         continue
        }
       }
       break;
      };
      $3_1 = HEAP32[$11_1 + 44 >> 2] - $15_1 | 0;
      HEAP32[$11_1 + 44 >> 2] = $3_1;
      $7_1 = $6_1;
      if (($3_1 | 0) > 0) {
       continue
      }
      break;
     };
    }
    if (($3_1 | 0) < 0) {
     $17_1 = (($12_1 + 25 >>> 0) / 9 | 0) + 1 | 0;
     $15_1 = ($16_1 | 0) == 102;
     while (1) {
      $3_1 = 0 - $3_1 | 0;
      $8_1 = ($3_1 | 0) >= 9 ? 9 : $3_1;
      block8 : {
       if ($6_1 >>> 0 <= $9 >>> 0) {
        $7_1 = HEAP32[$9 >> 2];
        break block8;
       }
       $14_1 = 1e9 >>> $8_1 | 0;
       $21_1 = -1 << $8_1 ^ -1;
       $3_1 = 0;
       $7_1 = $9;
       while (1) {
        $23_1 = HEAP32[$7_1 >> 2];
        HEAP32[$7_1 >> 2] = $3_1 + ($23_1 >>> $8_1 | 0);
        $3_1 = Math_imul($14_1, $21_1 & $23_1);
        $7_1 = $7_1 + 4 | 0;
        if ($7_1 >>> 0 < $6_1 >>> 0) {
         continue
        }
        break;
       };
       $7_1 = HEAP32[$9 >> 2];
       if (!$3_1) {
        break block8
       }
       HEAP32[$6_1 >> 2] = $3_1;
       $6_1 = $6_1 + 4 | 0;
      }
      $3_1 = $8_1 + HEAP32[$11_1 + 44 >> 2] | 0;
      HEAP32[$11_1 + 44 >> 2] = $3_1;
      $9 = (!$7_1 << 2) + $9 | 0;
      $7_1 = $15_1 ? $13_1 : $9;
      $6_1 = $6_1 - $7_1 >> 2 > ($17_1 | 0) ? $7_1 + ($17_1 << 2) | 0 : $6_1;
      if (($3_1 | 0) < 0) {
       continue
      }
      break;
     };
    }
    $3_1 = 0;
    block9 : {
     if ($6_1 >>> 0 <= $9 >>> 0) {
      break block9
     }
     $3_1 = Math_imul($13_1 - $9 >> 2, 9);
     $7_1 = 10;
     $8_1 = HEAP32[$9 >> 2];
     if ($8_1 >>> 0 < 10) {
      break block9
     }
     while (1) {
      $3_1 = $3_1 + 1 | 0;
      $7_1 = Math_imul($7_1, 10);
      if ($8_1 >>> 0 >= $7_1 >>> 0) {
       continue
      }
      break;
     };
    }
    $7_1 = ($12_1 - (($16_1 | 0) != 102 ? $3_1 : 0) | 0) - (($16_1 | 0) == 103 & ($12_1 | 0) != 0) | 0;
    if (($7_1 | 0) < (Math_imul($6_1 - $13_1 >> 2, 9) - 9 | 0)) {
     $8_1 = $7_1 + 9216 | 0;
     $17_1 = ($8_1 | 0) / 9 | 0;
     $10_1 = (((($10_1 | 0) < 0 ? 4 : 292) + $11_1 | 0) + ($17_1 << 2) | 0) - 4048 | 0;
     $7_1 = 10;
     $8_1 = $8_1 + Math_imul($17_1, -9) | 0;
     if (($8_1 | 0) <= 7) {
      while (1) {
       $7_1 = Math_imul($7_1, 10);
       $8_1 = $8_1 + 1 | 0;
       if (($8_1 | 0) != 8) {
        continue
       }
       break;
      }
     }
     $15_1 = HEAP32[$10_1 >> 2];
     $17_1 = ($15_1 >>> 0) / ($7_1 >>> 0) | 0;
     $8_1 = Math_imul($17_1, $7_1);
     $14_1 = $10_1 + 4 | 0;
     block10 : {
      if (($8_1 | 0) == ($15_1 | 0) & ($14_1 | 0) == ($6_1 | 0)) {
       break block10
      }
      $15_1 = $15_1 - $8_1 | 0;
      block11 : {
       if (!($17_1 & 1)) {
        $1_1 = 9007199254740992.0;
        if (!(HEAP8[$10_1 - 4 | 0] & 1) | (($7_1 | 0) != 1e9 | $9 >>> 0 >= $10_1 >>> 0)) {
         break block11
        }
       }
       $1_1 = 9007199254740994.0;
      }
      $18_1 = ($6_1 | 0) == ($14_1 | 0) ? 1.0 : 1.5;
      $14_1 = $7_1 >>> 1 | 0;
      $18_1 = $15_1 >>> 0 < $14_1 >>> 0 ? .5 : ($14_1 | 0) == ($15_1 | 0) ? $18_1 : 1.5;
      if (!(HEAPU8[$22_1 | 0] != 45 | $24_1)) {
       $18_1 = -$18_1;
       $1_1 = -$1_1;
      }
      HEAP32[$10_1 >> 2] = $8_1;
      if ($1_1 + $18_1 == $1_1) {
       break block10
      }
      $3_1 = $7_1 + $8_1 | 0;
      HEAP32[$10_1 >> 2] = $3_1;
      if ($3_1 >>> 0 >= 1e9) {
       while (1) {
        HEAP32[$10_1 >> 2] = 0;
        $10_1 = $10_1 - 4 | 0;
        if ($10_1 >>> 0 < $9 >>> 0) {
         $9 = $9 - 4 | 0;
         HEAP32[$9 >> 2] = 0;
        }
        $3_1 = HEAP32[$10_1 >> 2] + 1 | 0;
        HEAP32[$10_1 >> 2] = $3_1;
        if ($3_1 >>> 0 > 999999999) {
         continue
        }
        break;
       }
      }
      $3_1 = Math_imul($13_1 - $9 >> 2, 9);
      $7_1 = 10;
      $8_1 = HEAP32[$9 >> 2];
      if ($8_1 >>> 0 < 10) {
       break block10
      }
      while (1) {
       $3_1 = $3_1 + 1 | 0;
       $7_1 = Math_imul($7_1, 10);
       if ($8_1 >>> 0 >= $7_1 >>> 0) {
        continue
       }
       break;
      };
     }
     $7_1 = $10_1 + 4 | 0;
     $6_1 = $6_1 >>> 0 > $7_1 >>> 0 ? $7_1 : $6_1;
    }
    while (1) {
     $7_1 = $6_1;
     $8_1 = $6_1 >>> 0 <= $9 >>> 0;
     if (!$8_1) {
      $6_1 = $6_1 - 4 | 0;
      if (!HEAP32[$6_1 >> 2]) {
       continue
      }
     }
     break;
    };
    block13 : {
     if (($16_1 | 0) != 103) {
      $10_1 = $4_1 & 8;
      break block13;
     }
     $6_1 = $12_1 ? $12_1 : 1;
     $10_1 = ($6_1 | 0) > ($3_1 | 0) & ($3_1 | 0) > -5;
     $12_1 = ($10_1 ? $3_1 ^ -1 : -1) + $6_1 | 0;
     $5_1 = ($10_1 ? -1 : -2) + $5_1 | 0;
     $10_1 = $4_1 & 8;
     if ($10_1) {
      break block13
     }
     $6_1 = -9;
     block14 : {
      if ($8_1) {
       break block14
      }
      $16_1 = HEAP32[$7_1 - 4 >> 2];
      if (!$16_1) {
       break block14
      }
      $8_1 = 10;
      $6_1 = 0;
      if (($16_1 >>> 0) % 10 | 0) {
       break block14
      }
      while (1) {
       $10_1 = $6_1;
       $6_1 = $6_1 + 1 | 0;
       $8_1 = Math_imul($8_1, 10);
       if (!(($16_1 >>> 0) % ($8_1 >>> 0) | 0)) {
        continue
       }
       break;
      };
      $6_1 = $10_1 ^ -1;
     }
     $8_1 = Math_imul($7_1 - $13_1 >> 2, 9);
     if (($5_1 & -33) == 70) {
      $10_1 = 0;
      $6_1 = ($6_1 + $8_1 | 0) - 9 | 0;
      $6_1 = ($6_1 | 0) > 0 ? $6_1 : 0;
      $12_1 = ($6_1 | 0) > ($12_1 | 0) ? $12_1 : $6_1;
      break block13;
     }
     $10_1 = 0;
     $6_1 = (($3_1 + $8_1 | 0) + $6_1 | 0) - 9 | 0;
     $6_1 = ($6_1 | 0) > 0 ? $6_1 : 0;
     $12_1 = ($6_1 | 0) > ($12_1 | 0) ? $12_1 : $6_1;
    }
    $8_1 = -1;
    $15_1 = $10_1 | $12_1;
    if ((($15_1 ? 2147483645 : 2147483646) | 0) < ($12_1 | 0)) {
     break block1
    }
    $16_1 = ((($15_1 | 0) != 0) + $12_1 | 0) + 1 | 0;
    $14_1 = $5_1 & -33;
    block15 : {
     if (($14_1 | 0) == 70) {
      if (($16_1 ^ 2147483647) < ($3_1 | 0)) {
       break block1
      }
      $6_1 = ($3_1 | 0) > 0 ? $3_1 : 0;
      break block15;
     }
     $6_1 = $3_1 >> 31;
     $6_1 = $41(($6_1 ^ $3_1) - $6_1 | 0, 0, $20_1);
     if (($20_1 - $6_1 | 0) <= 1) {
      while (1) {
       $6_1 = $6_1 - 1 | 0;
       HEAP8[$6_1 | 0] = 48;
       if (($20_1 - $6_1 | 0) < 2) {
        continue
       }
       break;
      }
     }
     $17_1 = $6_1 - 2 | 0;
     HEAP8[$17_1 | 0] = $5_1;
     HEAP8[$6_1 - 1 | 0] = ($3_1 | 0) < 0 ? 45 : 43;
     $6_1 = $20_1 - $17_1 | 0;
     if (($6_1 | 0) > ($16_1 ^ 2147483647)) {
      break block1
     }
    }
    $3_1 = $6_1 + $16_1 | 0;
    if (($3_1 | 0) > ($19_1 ^ 2147483647)) {
     break block1
    }
    $5_1 = $3_1 + $19_1 | 0;
    $11($0_1, 32, $2_1, $5_1, $4_1);
    $8($0_1, $22_1, $19_1);
    $11($0_1, 48, $2_1, $5_1, $4_1 ^ 65536);
    block21 : {
     block18 : {
      block17 : {
       if (($14_1 | 0) == 70) {
        $6_1 = $11_1 + 16 | 0;
        $3_1 = $6_1 | 8;
        $10_1 = $6_1 | 9;
        $8_1 = $9 >>> 0 > $13_1 >>> 0 ? $13_1 : $9;
        $9 = $8_1;
        while (1) {
         $6_1 = $41(HEAP32[$9 >> 2], 0, $10_1);
         block16 : {
          if (($8_1 | 0) != ($9 | 0)) {
           if ($11_1 + 16 >>> 0 >= $6_1 >>> 0) {
            break block16
           }
           while (1) {
            $6_1 = $6_1 - 1 | 0;
            HEAP8[$6_1 | 0] = 48;
            if ($11_1 + 16 >>> 0 < $6_1 >>> 0) {
             continue
            }
            break;
           };
           break block16;
          }
          if (($6_1 | 0) != ($10_1 | 0)) {
           break block16
          }
          HEAP8[$11_1 + 24 | 0] = 48;
          $6_1 = $3_1;
         }
         $8($0_1, $6_1, $10_1 - $6_1 | 0);
         $9 = $9 + 4 | 0;
         if ($13_1 >>> 0 >= $9 >>> 0) {
          continue
         }
         break;
        };
        if ($15_1) {
         $8($0_1, 4748, 1)
        }
        if (($12_1 | 0) <= 0 | $7_1 >>> 0 <= $9 >>> 0) {
         break block17
        }
        while (1) {
         $6_1 = $41(HEAP32[$9 >> 2], 0, $10_1);
         if ($6_1 >>> 0 > $11_1 + 16 >>> 0) {
          while (1) {
           $6_1 = $6_1 - 1 | 0;
           HEAP8[$6_1 | 0] = 48;
           if ($11_1 + 16 >>> 0 < $6_1 >>> 0) {
            continue
           }
           break;
          }
         }
         $8($0_1, $6_1, ($12_1 | 0) >= 9 ? 9 : $12_1);
         $6_1 = $12_1 - 9 | 0;
         $9 = $9 + 4 | 0;
         if ($7_1 >>> 0 <= $9 >>> 0) {
          break block18
         }
         $3_1 = ($12_1 | 0) > 9;
         $12_1 = $6_1;
         if ($3_1) {
          continue
         }
         break;
        };
        break block18;
       }
       block19 : {
        if (($12_1 | 0) < 0) {
         break block19
        }
        $8_1 = $7_1 >>> 0 > $9 >>> 0 ? $7_1 : $9 + 4 | 0;
        $6_1 = $11_1 + 16 | 0;
        $3_1 = $6_1 | 8;
        $13_1 = $6_1 | 9;
        $7_1 = $9;
        while (1) {
         $6_1 = $41(HEAP32[$7_1 >> 2], 0, $13_1);
         if (($13_1 | 0) == ($6_1 | 0)) {
          HEAP8[$11_1 + 24 | 0] = 48;
          $6_1 = $3_1;
         }
         block20 : {
          if (($7_1 | 0) != ($9 | 0)) {
           if ($11_1 + 16 >>> 0 >= $6_1 >>> 0) {
            break block20
           }
           while (1) {
            $6_1 = $6_1 - 1 | 0;
            HEAP8[$6_1 | 0] = 48;
            if ($11_1 + 16 >>> 0 < $6_1 >>> 0) {
             continue
            }
            break;
           };
           break block20;
          }
          $8($0_1, $6_1, 1);
          $6_1 = $6_1 + 1 | 0;
          if (!($10_1 | $12_1)) {
           break block20
          }
          $8($0_1, 4748, 1);
         }
         $21_1 = $6_1;
         $6_1 = $13_1 - $6_1 | 0;
         $8($0_1, $21_1, ($6_1 | 0) > ($12_1 | 0) ? $12_1 : $6_1);
         $12_1 = $12_1 - $6_1 | 0;
         $7_1 = $7_1 + 4 | 0;
         if ($8_1 >>> 0 <= $7_1 >>> 0) {
          break block19
         }
         if (($12_1 | 0) >= 0) {
          continue
         }
         break;
        };
       }
       $11($0_1, 48, $12_1 + 18 | 0, 18, 0);
       $8($0_1, $17_1, $20_1 - $17_1 | 0);
       break block21;
      }
      $6_1 = $12_1;
     }
     $11($0_1, 48, $6_1 + 9 | 0, 9, 0);
    }
    $11($0_1, 32, $2_1, $5_1, $4_1 ^ 8192);
    $8_1 = ($2_1 | 0) < ($5_1 | 0) ? $5_1 : $2_1;
    break block1;
   }
   $12_1 = ($5_1 << 26 >> 31 & 9) + $22_1 | 0;
   block22 : {
    if ($3_1 >>> 0 > 11) {
     break block22
    }
    $6_1 = 12 - $3_1 | 0;
    $18_1 = 16.0;
    while (1) {
     $18_1 = $18_1 * 16.0;
     $6_1 = $6_1 - 1 | 0;
     if ($6_1) {
      continue
     }
     break;
    };
    if (HEAPU8[$12_1 | 0] == 45) {
     $1_1 = -($18_1 + (-$1_1 - $18_1));
     break block22;
    }
    $1_1 = $1_1 + $18_1 - $18_1;
   }
   $7_1 = HEAP32[$11_1 + 44 >> 2];
   $6_1 = $7_1 >> 31;
   $10_1 = $19_1 | 2;
   $9 = $5_1 & 32;
   $6_1 = $41(($6_1 ^ $7_1) - $6_1 | 0, 0, $20_1);
   if (($20_1 | 0) == ($6_1 | 0)) {
    HEAP8[$11_1 + 15 | 0] = 48;
    $6_1 = $11_1 + 15 | 0;
   }
   $13_1 = $6_1 - 2 | 0;
   HEAP8[$13_1 | 0] = $5_1 + 15;
   HEAP8[$6_1 - 1 | 0] = ($7_1 | 0) < 0 ? 45 : 43;
   $6_1 = $4_1 & 8;
   $7_1 = $11_1 + 16 | 0;
   while (1) {
    $5_1 = Math_abs($1_1) < 2147483648.0 ? ~~$1_1 : -2147483648;
    HEAP8[$7_1 | 0] = $9 | HEAPU8[$5_1 + 6032 | 0];
    $1_1 = ($1_1 - +($5_1 | 0)) * 16.0;
    $5_1 = $7_1;
    $7_1 = $7_1 + 1 | 0;
    if (!(!($6_1 | ($3_1 | 0) > 0) & $1_1 == 0.0 | ($7_1 - ($11_1 + 16 | 0) | 0) != 1)) {
     HEAP8[$5_1 + 1 | 0] = 46;
     $7_1 = $5_1 + 2 | 0;
    }
    if ($1_1 != 0.0) {
     continue
    }
    break;
   };
   $8_1 = -1;
   $5_1 = $20_1 - $13_1 | 0;
   $6_1 = $5_1 + $10_1 | 0;
   if ((2147483645 - $6_1 | 0) < ($3_1 | 0)) {
    break block1
   }
   $21_1 = $6_1;
   block25 : {
    block24 : {
     if (!$3_1) {
      break block24
     }
     $9 = $7_1 - ($11_1 + 16 | 0) | 0;
     if (($9 - 2 | 0) >= ($3_1 | 0)) {
      break block24
     }
     $6_1 = $3_1 + 2 | 0;
     break block25;
    }
    $9 = $7_1 - ($11_1 + 16 | 0) | 0;
    $6_1 = $9;
   }
   $3_1 = $21_1 + $6_1 | 0;
   $11($0_1, 32, $2_1, $3_1, $4_1);
   $8($0_1, $12_1, $10_1);
   $11($0_1, 48, $2_1, $3_1, $4_1 ^ 65536);
   $8($0_1, $11_1 + 16 | 0, $9);
   $11($0_1, 48, $6_1 - $9 | 0, 0, 0);
   $8($0_1, $13_1, $5_1);
   $11($0_1, 32, $2_1, $3_1, $4_1 ^ 8192);
   $8_1 = ($2_1 | 0) < ($3_1 | 0) ? $3_1 : $2_1;
  }
  global$0 = $11_1 + 560 | 0;
  return $8_1 | 0;
 }
 
 function $142($0_1, $1_1, $2_1, $3_1) {
  $0_1 = $0_1 | 0;
  $1_1 = $1_1 | 0;
  $2_1 = $2_1 | 0;
  $3_1 = $3_1 | 0;
  var $4_1 = 0;
  $4_1 = global$0 - 16 | 0;
  global$0 = $4_1;
  $0_1 = $111(fimport$20(HEAP32[$0_1 + 60 >> 2], $1_1 | 0, $2_1 | 0, $3_1 & 255, $4_1 + 8 | 0) | 0);
  global$0 = $4_1 + 16 | 0;
  i64toi32_i32$HIGH_BITS = $0_1 ? -1 : HEAP32[$4_1 + 12 >> 2];
  return ($0_1 ? -1 : HEAP32[$4_1 + 8 >> 2]) | 0;
 }
 
 function $143($0_1, $1_1, $2_1) {
  $0_1 = $0_1 | 0;
  $1_1 = $1_1 | 0;
  $2_1 = $2_1 | 0;
  var $3_1 = 0, $4_1 = 0, $5_1 = 0, $6_1 = 0, $7_1 = 0, $8_1 = 0, $9 = 0;
  $3_1 = global$0 - 32 | 0;
  global$0 = $3_1;
  $4_1 = HEAP32[$0_1 + 28 >> 2];
  HEAP32[$3_1 + 16 >> 2] = $4_1;
  $5_1 = HEAP32[$0_1 + 20 >> 2];
  HEAP32[$3_1 + 28 >> 2] = $2_1;
  HEAP32[$3_1 + 24 >> 2] = $1_1;
  $1_1 = $5_1 - $4_1 | 0;
  HEAP32[$3_1 + 20 >> 2] = $1_1;
  $5_1 = $1_1 + $2_1 | 0;
  $8_1 = 2;
  $1_1 = $3_1 + 16 | 0;
  block3 : {
   while (1) {
    block2 : {
     block1 : {
      block : {
       if (!$111(fimport$24(HEAP32[$0_1 + 60 >> 2], $1_1 | 0, $8_1 | 0, $3_1 + 12 | 0) | 0)) {
        $6_1 = HEAP32[$3_1 + 12 >> 2];
        if (($6_1 | 0) == ($5_1 | 0)) {
         break block
        }
        if (($6_1 | 0) >= 0) {
         break block1
        }
        break block2;
       }
       if (($5_1 | 0) != -1) {
        break block2
       }
      }
      $1_1 = HEAP32[$0_1 + 44 >> 2];
      HEAP32[$0_1 + 28 >> 2] = $1_1;
      HEAP32[$0_1 + 20 >> 2] = $1_1;
      HEAP32[$0_1 + 16 >> 2] = $1_1 + HEAP32[$0_1 + 48 >> 2];
      $0_1 = $2_1;
      break block3;
     }
     $7_1 = HEAP32[$1_1 + 4 >> 2];
     $9 = $7_1 >>> 0 < $6_1 >>> 0;
     $4_1 = ($9 << 3) + $1_1 | 0;
     $7_1 = $6_1 - ($9 ? $7_1 : 0) | 0;
     HEAP32[$4_1 >> 2] = $7_1 + HEAP32[$4_1 >> 2];
     $1_1 = ($9 ? 12 : 4) + $1_1 | 0;
     HEAP32[$1_1 >> 2] = HEAP32[$1_1 >> 2] - $7_1;
     $5_1 = $5_1 - $6_1 | 0;
     $8_1 = $8_1 - $9 | 0;
     $1_1 = $4_1;
     continue;
    }
    break;
   };
   HEAP32[$0_1 + 28 >> 2] = 0;
   HEAP32[$0_1 + 16 >> 2] = 0;
   HEAP32[$0_1 + 20 >> 2] = 0;
   HEAP32[$0_1 >> 2] = HEAP32[$0_1 >> 2] | 32;
   $0_1 = 0;
   if (($8_1 | 0) == 2) {
    break block3
   }
   $0_1 = $2_1 - HEAP32[$1_1 + 4 >> 2] | 0;
  }
  global$0 = $3_1 + 32 | 0;
  return $0_1 | 0;
 }
 
 function $144($0_1) {
  $0_1 = $0_1 | 0;
  return fimport$25(HEAP32[$0_1 + 60 >> 2]) | 0;
 }
 
 function $145() {
  var $0_1 = 0;
  $0_1 = HEAP32[1906];
  if ($0_1) {
   while (1) {
    FUNCTION_TABLE[HEAP32[$0_1 >> 2]]();
    $0_1 = HEAP32[$0_1 + 4 >> 2];
    if ($0_1) {
     continue
    }
    break;
   }
  }
 }
 
 function $146($0_1) {
  $0_1 = $0_1 | 0;
  var $1_1 = 0, $2_1 = 0, $3_1 = 0, $4_1 = 0, $5_1 = 0;
  $2_1 = global$0 - 96 | 0;
  global$0 = $2_1;
  HEAP32[$2_1 >> 2] = $0_1;
  $3_1 = global$0 - 16 | 0;
  global$0 = $3_1;
  HEAP32[$3_1 + 12 >> 2] = $2_1;
  $0_1 = global$0 - 144 | 0;
  global$0 = $0_1;
  $0_1 = $13($0_1, 6048, 144);
  $5_1 = $2_1 + 16 | 0;
  $1_1 = $5_1;
  HEAP32[$0_1 + 44 >> 2] = $1_1;
  HEAP32[$0_1 + 20 >> 2] = $1_1;
  $4_1 = -2 - $1_1 | 0;
  $4_1 = $4_1 >>> 0 >= 2147483647 ? 2147483647 : $4_1;
  HEAP32[$0_1 + 48 >> 2] = $4_1;
  $1_1 = $1_1 + $4_1 | 0;
  HEAP32[$0_1 + 28 >> 2] = $1_1;
  HEAP32[$0_1 + 16 >> 2] = $1_1;
  $109($0_1, 2491, $2_1, 0, 0);
  if ($4_1) {
   $1_1 = HEAP32[$0_1 + 20 >> 2];
   HEAP8[$1_1 - (($1_1 | 0) == HEAP32[$0_1 + 16 >> 2]) | 0] = 0;
  }
  global$0 = $0_1 + 144 | 0;
  global$0 = $3_1 + 16 | 0;
  $0_1 = $5_1;
  block : {
   if ($0_1 & 3) {
    while (1) {
     if (!HEAPU8[$0_1 | 0]) {
      break block
     }
     $0_1 = $0_1 + 1 | 0;
     if ($0_1 & 3) {
      continue
     }
     break;
    }
   }
   while (1) {
    $1_1 = $0_1;
    $0_1 = $0_1 + 4 | 0;
    $3_1 = HEAP32[$1_1 >> 2];
    if (!(($3_1 ^ -1) & $3_1 - 16843009 & -2139062144)) {
     continue
    }
    break;
   };
   while (1) {
    $0_1 = $1_1;
    $1_1 = $0_1 + 1 | 0;
    if (HEAPU8[$0_1 | 0]) {
     continue
    }
    break;
   };
  }
  $0_1 = ($0_1 - $5_1 | 0) + 1 | 0;
  $1_1 = $67($0_1);
  if ($1_1) {
   $0_1 = $13($1_1, $5_1, $0_1)
  } else {
   $0_1 = 0
  }
  global$0 = $2_1 + 96 | 0;
  return $0_1 | 0;
 }
 
 function $147($0_1, $1_1, $2_1, $3_1, $4_1, $5_1) {
  $0_1 = $0_1 | 0;
  $1_1 = $1_1 | 0;
  $2_1 = Math_fround($2_1);
  $3_1 = $3_1 | 0;
  $4_1 = Math_fround($4_1);
  $5_1 = $5_1 | 0;
  var $6_1 = 0, $7_1 = 0.0, $8_1 = 0;
  $6_1 = global$0 - 48 | 0;
  global$0 = $6_1;
  $8_1 = HEAP32[$1_1 + 8 >> 2];
  block : {
   if (HEAP8[7604] & 1) {
    $1_1 = HEAP32[1900];
    break block;
   }
   $1_1 = fimport$12(5, 5008) | 0;
   HEAP8[7604] = 1;
   HEAP32[1900] = $1_1;
  }
  HEAP32[$6_1 + 40 >> 2] = $5_1;
  HEAPF32[$6_1 + 32 >> 2] = $4_1;
  HEAP32[$6_1 + 24 >> 2] = $3_1;
  HEAPF32[$6_1 + 16 >> 2] = $2_1;
  $7_1 = +fimport$18($1_1 | 0, $8_1 | 0, 3479, $6_1 + 12 | 0, $6_1 + 16 | 0);
  block1 : {
   if ($7_1 < 4294967296.0 & $7_1 >= 0.0) {
    $1_1 = ~~$7_1 >>> 0;
    break block1;
   }
   $1_1 = 0;
  }
  $3_1 = HEAP32[$6_1 + 12 >> 2];
  $5_1 = HEAP32[$1_1 + 4 >> 2];
  HEAP32[$0_1 >> 2] = HEAP32[$1_1 >> 2];
  HEAP32[$0_1 + 4 >> 2] = $5_1;
  $5_1 = HEAP32[$1_1 + 12 >> 2];
  HEAP32[$0_1 + 8 >> 2] = HEAP32[$1_1 + 8 >> 2];
  HEAP32[$0_1 + 12 >> 2] = $5_1;
  fimport$17($3_1 | 0);
  global$0 = $6_1 + 48 | 0;
 }
 
 function $148($0_1) {
  $0_1 = $0_1 | 0;
  $5($114($0_1));
 }
 
 function $149($0_1) {
  $0_1 = $0_1 | 0;
  $72(HEAP32[$0_1 + 8 >> 2], 3688);
 }
 
 function $150($0_1) {
  $0_1 = $0_1 | 0;
  $5($116($0_1));
 }
 
 function $151($0_1, $1_1) {
  $0_1 = $0_1 | 0;
  $1_1 = $1_1 | 0;
  var $2_1 = 0, $3_1 = 0;
  $2_1 = global$0 - 48 | 0;
  global$0 = $2_1;
  $3_1 = HEAP32[$0_1 >> 2];
  $0_1 = HEAP32[$0_1 + 4 >> 2];
  $1_1 = ($0_1 >> 1) + $1_1 | 0;
  if ($0_1 & 1) {
   $3_1 = HEAP32[$3_1 + HEAP32[$1_1 >> 2] >> 2]
  }
  FUNCTION_TABLE[$3_1 | 0]($2_1, $1_1);
  $0_1 = $13($0(48), $2_1, 48);
  global$0 = $2_1 + 48 | 0;
  return $0_1 | 0;
 }
 
 function $152($0_1, $1_1, $2_1, $3_1, $4_1) {
  $0_1 = $0_1 | 0;
  $1_1 = $1_1 | 0;
  $2_1 = +$2_1;
  $3_1 = +$3_1;
  $4_1 = $4_1 | 0;
  var $5_1 = 0;
  $5_1 = HEAP32[$0_1 >> 2];
  $0_1 = HEAP32[$0_1 + 4 >> 2];
  $1_1 = ($0_1 >> 1) + $1_1 | 0;
  if ($0_1 & 1) {
   $5_1 = HEAP32[$5_1 + HEAP32[$1_1 >> 2] >> 2]
  }
  FUNCTION_TABLE[$5_1 | 0]($1_1, $2_1, $3_1, $4_1);
 }
 
 function $153($0_1, $1_1, $2_1) {
  $0_1 = $0_1 | 0;
  $1_1 = $1_1 | 0;
  $2_1 = $2_1 | 0;
  var $3_1 = 0;
  $3_1 = HEAP32[$0_1 >> 2];
  $0_1 = HEAP32[$0_1 + 4 >> 2];
  $1_1 = ($0_1 >> 1) + $1_1 | 0;
  if ($0_1 & 1) {
   $3_1 = HEAP32[$3_1 + HEAP32[$1_1 >> 2] >> 2]
  }
  return Math_fround(Math_fround(FUNCTION_TABLE[$3_1 | 0]($1_1, $2_1)));
 }
 
 function $154($0_1, $1_1, $2_1) {
  $0_1 = $0_1 | 0;
  $1_1 = $1_1 | 0;
  $2_1 = $2_1 | 0;
  var $3_1 = 0;
  $3_1 = HEAP32[$0_1 >> 2];
  $0_1 = HEAP32[$0_1 + 4 >> 2];
  $1_1 = ($0_1 >> 1) + $1_1 | 0;
  if ($0_1 & 1) {
   $3_1 = HEAP32[$3_1 + HEAP32[$1_1 >> 2] >> 2]
  }
  return +FUNCTION_TABLE[$3_1 | 0]($1_1, $2_1);
 }
 
 function $155($0_1, $1_1) {
  $0_1 = $0_1 | 0;
  $1_1 = $1_1 | 0;
  var $2_1 = 0;
  $2_1 = HEAP32[$0_1 >> 2];
  $0_1 = HEAP32[$0_1 + 4 >> 2];
  $1_1 = ($0_1 >> 1) + $1_1 | 0;
  if ($0_1 & 1) {
   $2_1 = HEAP32[$2_1 + HEAP32[$1_1 >> 2] >> 2]
  }
  return +FUNCTION_TABLE[$2_1 | 0]($1_1);
 }
 
 function $156($0_1, $1_1) {
  $0_1 = $0_1 | 0;
  $1_1 = $1_1 | 0;
  var $2_1 = 0, $3_1 = 0;
  $2_1 = global$0 - 16 | 0;
  global$0 = $2_1;
  $3_1 = HEAP32[$0_1 >> 2];
  $0_1 = HEAP32[$0_1 + 4 >> 2];
  $1_1 = ($0_1 >> 1) + $1_1 | 0;
  if ($0_1 & 1) {
   $3_1 = HEAP32[$3_1 + HEAP32[$1_1 >> 2] >> 2]
  }
  FUNCTION_TABLE[$3_1 | 0]($2_1, $1_1);
  $0_1 = $0(16);
  $1_1 = HEAP32[$2_1 + 12 >> 2];
  HEAP32[$0_1 + 8 >> 2] = HEAP32[$2_1 + 8 >> 2];
  HEAP32[$0_1 + 12 >> 2] = $1_1;
  $1_1 = HEAP32[$2_1 + 4 >> 2];
  HEAP32[$0_1 >> 2] = HEAP32[$2_1 >> 2];
  HEAP32[$0_1 + 4 >> 2] = $1_1;
  global$0 = $2_1 + 16 | 0;
  return $0_1 | 0;
 }
 
 function $157($0_1, $1_1, $2_1) {
  $0_1 = $0_1 | 0;
  $1_1 = $1_1 | 0;
  $2_1 = $2_1 | 0;
  var $3_1 = 0, $4_1 = 0;
  $3_1 = global$0 - 16 | 0;
  global$0 = $3_1;
  $4_1 = HEAP32[$0_1 >> 2];
  $0_1 = HEAP32[$0_1 + 4 >> 2];
  $1_1 = ($0_1 >> 1) + $1_1 | 0;
  if ($0_1 & 1) {
   $4_1 = HEAP32[$4_1 + HEAP32[$1_1 >> 2] >> 2]
  }
  FUNCTION_TABLE[$4_1 | 0]($3_1, $1_1, $2_1);
  $0_1 = $0(16);
  $1_1 = HEAP32[$3_1 + 12 >> 2];
  HEAP32[$0_1 + 8 >> 2] = HEAP32[$3_1 + 8 >> 2];
  HEAP32[$0_1 + 12 >> 2] = $1_1;
  $1_1 = HEAP32[$3_1 + 4 >> 2];
  HEAP32[$0_1 >> 2] = HEAP32[$3_1 >> 2];
  HEAP32[$0_1 + 4 >> 2] = $1_1;
  global$0 = $3_1 + 16 | 0;
  return $0_1 | 0;
 }
 
 function $158($0_1, $1_1, $2_1) {
  $0_1 = $0_1 | 0;
  $1_1 = $1_1 | 0;
  $2_1 = +$2_1;
  var $3_1 = 0;
  $3_1 = HEAP32[$0_1 >> 2];
  $0_1 = HEAP32[$0_1 + 4 >> 2];
  $1_1 = ($0_1 >> 1) + $1_1 | 0;
  if ($0_1 & 1) {
   $3_1 = HEAP32[$3_1 + HEAP32[$1_1 >> 2] >> 2]
  }
  FUNCTION_TABLE[$3_1 | 0]($1_1, $2_1);
 }
 
 function $159($0_1, $1_1, $2_1, $3_1) {
  $0_1 = $0_1 | 0;
  $1_1 = $1_1 | 0;
  $2_1 = $2_1 | 0;
  $3_1 = +$3_1;
  var $4_1 = 0;
  $4_1 = HEAP32[$0_1 >> 2];
  $0_1 = HEAP32[$0_1 + 4 >> 2];
  $1_1 = ($0_1 >> 1) + $1_1 | 0;
  if ($0_1 & 1) {
   $4_1 = HEAP32[$4_1 + HEAP32[$1_1 >> 2] >> 2]
  }
  FUNCTION_TABLE[$4_1 | 0]($1_1, $2_1, $3_1);
 }
 
 function $160($0_1, $1_1) {
  $0_1 = $0_1 | 0;
  $1_1 = $1_1 | 0;
  return FUNCTION_TABLE[$0_1 | 0]($1_1) | 0;
 }
 
 function $161($0_1) {
  $0_1 = $0_1 | 0;
  return 7619;
 }
 
 function $162($0_1, $1_1, $2_1) {
  $0_1 = $0_1 | 0;
  $1_1 = $1_1 | 0;
  $2_1 = $2_1 | 0;
  HEAP32[HEAP32[$0_1 >> 2] + $1_1 >> 2] = $2_1;
 }
 
 function $163($0_1, $1_1) {
  $0_1 = $0_1 | 0;
  $1_1 = $1_1 | 0;
  return HEAP32[HEAP32[$0_1 >> 2] + $1_1 >> 2];
 }
 
 function $164() {
  var $0_1 = 0;
  $0_1 = $0(16);
  HEAP32[$0_1 + 8 >> 2] = 0;
  HEAP32[$0_1 + 12 >> 2] = 0;
  HEAP32[$0_1 >> 2] = 0;
  return $0_1 | 0;
 }
 
 function $165() {
  var $0_1 = 0;
  $0_1 = $0(16);
  HEAP32[$0_1 >> 2] = 0;
  HEAP32[$0_1 + 4 >> 2] = 0;
  HEAP32[$0_1 + 8 >> 2] = 0;
  HEAP32[$0_1 + 12 >> 2] = 0;
  return $0_1 | 0;
 }
 
 function $166() {
  return $12($0(48), 0, 48) | 0;
 }
 
 function $167($0_1, $1_1, $2_1) {
  $0_1 = $0_1 | 0;
  $1_1 = $1_1 | 0;
  $2_1 = Math_fround($2_1);
  var $3_1 = 0;
  $3_1 = HEAP32[$0_1 >> 2];
  $0_1 = HEAP32[$0_1 + 4 >> 2];
  $1_1 = ($0_1 >> 1) + $1_1 | 0;
  if ($0_1 & 1) {
   $3_1 = HEAP32[$3_1 + HEAP32[$1_1 >> 2] >> 2]
  }
  FUNCTION_TABLE[$3_1 | 0]($1_1, $2_1);
 }
 
 function $168($0_1) {
  $0_1 = $0_1 | 0;
  return 7614;
 }
 
 function $169($0_1, $1_1, $2_1) {
  $0_1 = $0_1 | 0;
  $1_1 = $1_1 | 0;
  $2_1 = $2_1 | 0;
  var wasm2js_i32$0 = 0, wasm2js_i32$1 = 0;
  (wasm2js_i32$0 = $0_1, wasm2js_i32$1 = fimport$16((HEAP8[$1_1 + 11 | 0] < 0 ? HEAP32[$1_1 >> 2] : $1_1) | 0, 7611, HEAP32[$2_1 >> 2]) | 0), HEAP32[wasm2js_i32$0 >> 2] = wasm2js_i32$1;
 }
 
 function $170($0_1) {
  $0_1 = $0_1 | 0;
  var $1_1 = 0;
  $1_1 = $0(12);
  HEAP8[$1_1 + 4 | 0] = 0;
  HEAP32[$1_1 + 8 >> 2] = HEAP32[$0_1 >> 2];
  HEAP32[$0_1 >> 2] = 0;
  HEAP32[$1_1 >> 2] = 5080;
  return $1_1 | 0;
 }
 
 function $171($0_1) {
  $0_1 = $0_1 | 0;
  return 7611;
 }
 
 function $172($0_1) {
  $0_1 = $0_1 | 0;
  return 7608;
 }
 
 function $173($0_1, $1_1, $2_1) {
  $0_1 = $0_1 | 0;
  $1_1 = $1_1 | 0;
  $2_1 = $2_1 | 0;
  var wasm2js_i32$0 = 0, wasm2js_i32$1 = 0;
  (wasm2js_i32$0 = $0_1, wasm2js_i32$1 = fimport$16((HEAP8[$1_1 + 11 | 0] < 0 ? HEAP32[$1_1 >> 2] : $1_1) | 0, 7588, HEAP32[$2_1 >> 2]) | 0), HEAP32[wasm2js_i32$0 >> 2] = wasm2js_i32$1;
 }
 
 function $174($0_1, $1_1, $2_1) {
  $0_1 = $0_1 | 0;
  $1_1 = $1_1 | 0;
  $2_1 = $2_1 | 0;
  var $3_1 = 0, $4_1 = 0, $5_1 = 0, $6_1 = 0;
  $3_1 = global$0 - 32 | 0;
  global$0 = $3_1;
  $4_1 = HEAP32[$1_1 >> 2];
  if ($4_1 >>> 0 < 2147483632) {
   block1 : {
    block : {
     if ($4_1 >>> 0 >= 11) {
      $5_1 = ($4_1 | 15) + 1 | 0;
      $6_1 = $0($5_1);
      HEAP32[$3_1 + 16 >> 2] = $5_1 | -2147483648;
      HEAP32[$3_1 + 8 >> 2] = $6_1;
      HEAP32[$3_1 + 12 >> 2] = $4_1;
      $5_1 = $4_1 + $6_1 | 0;
      break block;
     }
     HEAP8[$3_1 + 19 | 0] = $4_1;
     $6_1 = $3_1 + 8 | 0;
     $5_1 = $6_1 + $4_1 | 0;
     if (!$4_1) {
      break block1
     }
    }
    $13($6_1, $1_1 + 4 | 0, $4_1);
   }
   HEAP8[$5_1 | 0] = 0;
   HEAP32[$3_1 >> 2] = $2_1;
   FUNCTION_TABLE[$0_1 | 0]($3_1 + 24 | 0, $3_1 + 8 | 0, $3_1);
   fimport$29(HEAP32[$3_1 + 24 >> 2]);
   $0_1 = HEAP32[$3_1 + 24 >> 2];
   fimport$6($0_1 | 0);
   fimport$6(HEAP32[$3_1 >> 2]);
   if (HEAP8[$3_1 + 19 | 0] < 0) {
    $5(HEAP32[$3_1 + 8 >> 2])
   }
   global$0 = $3_1 + 32 | 0;
   return $0_1 | 0;
  }
  fimport$2();
  wasm2js_trap();
 }
 
 function $175($0_1) {
  $0_1 = $0_1 | 0;
  var $1_1 = 0;
  $1_1 = $0(12);
  HEAP8[$1_1 + 4 | 0] = 0;
  HEAP32[$1_1 + 8 >> 2] = HEAP32[$0_1 >> 2];
  HEAP32[$0_1 >> 2] = 0;
  HEAP32[$1_1 >> 2] = 4960;
  return $1_1 | 0;
 }
 
 function $176($0_1) {
  $0_1 = $0_1 | 0;
  return 7588;
 }
 
 function $177($0_1, $1_1, $2_1, $3_1, $4_1, $5_1) {
  $0_1 = $0_1 | 0;
  $1_1 = $1_1 | 0;
  $2_1 = Math_fround($2_1);
  $3_1 = $3_1 | 0;
  $4_1 = Math_fround($4_1);
  $5_1 = $5_1 | 0;
  var $6_1 = 0, $7_1 = 0;
  $6_1 = global$0 - 16 | 0;
  global$0 = $6_1;
  $7_1 = HEAP32[$0_1 >> 2];
  $0_1 = HEAP32[$0_1 + 4 >> 2];
  $1_1 = ($0_1 >> 1) + $1_1 | 0;
  if ($0_1 & 1) {
   $7_1 = HEAP32[$7_1 + HEAP32[$1_1 >> 2] >> 2]
  }
  FUNCTION_TABLE[$7_1 | 0]($6_1, $1_1, $2_1, $3_1, $4_1, $5_1);
  $0_1 = $0(16);
  $1_1 = HEAP32[$6_1 + 12 >> 2];
  HEAP32[$0_1 + 8 >> 2] = HEAP32[$6_1 + 8 >> 2];
  HEAP32[$0_1 + 12 >> 2] = $1_1;
  $1_1 = HEAP32[$6_1 + 4 >> 2];
  HEAP32[$0_1 >> 2] = HEAP32[$6_1 >> 2];
  HEAP32[$0_1 + 4 >> 2] = $1_1;
  global$0 = $6_1 + 16 | 0;
  return $0_1 | 0;
 }
 
 function $178($0_1) {
  $0_1 = $0_1 | 0;
  return 7584;
 }
 
 function $179($0_1, $1_1) {
  $0_1 = $0_1 | 0;
  $1_1 = $1_1 | 0;
  $0_1 = HEAP32[$0_1 >> 2];
  HEAP8[$0_1 | 0] = HEAPU8[$0_1 | 0] & 247 | ($1_1 ? 8 : 0);
 }
 
 function $180($0_1, $1_1) {
  $0_1 = $0_1 | 0;
  $1_1 = $1_1 | 0;
  var $2_1 = 0, $3_1 = 0;
  $2_1 = global$0 - 16 | 0;
  global$0 = $2_1;
  $0_1 = HEAP32[$0_1 >> 2];
  $3_1 = $1_1 & 255;
  if ($3_1 >>> 0 < 6) {
   global$0 = $2_1 + 16 | 0;
   block3 : {
    block2 : {
     switch ($3_1 - 4 | 0) {
     case 0:
      $1_1 = $0_1 + 468 | 0;
      if ((HEAPU8[$0_1 + 392 | 0] & 3) == 2) {
       break block3
      }
      $1_1 = $0_1 + 460 | 0;
      break block3;
     case 1:
      $1_1 = $0_1 + 460 | 0;
      if ((HEAPU8[$0_1 + 392 | 0] & 3) == 2) {
       break block3
      }
      $1_1 = $0_1 + 468 | 0;
      break block3;
     default:
      break block2;
     };
    }
    $1_1 = ($0_1 + (($1_1 & 255) << 2) | 0) + 460 | 0;
   }
   return +HEAPF32[$1_1 >> 2];
  }
  HEAP32[$2_1 >> 2] = 2158;
  $14($0_1, 5, 4824, $2_1);
  $6();
  wasm2js_trap();
 }
 
 function $181($0_1, $1_1) {
  $0_1 = $0_1 | 0;
  $1_1 = $1_1 | 0;
  var $2_1 = 0, $3_1 = 0;
  $2_1 = global$0 - 16 | 0;
  global$0 = $2_1;
  $0_1 = HEAP32[$0_1 >> 2];
  $3_1 = $1_1 & 255;
  if ($3_1 >>> 0 < 6) {
   global$0 = $2_1 + 16 | 0;
   block3 : {
    block2 : {
     switch ($3_1 - 4 | 0) {
     case 0:
      $1_1 = $0_1 + 452 | 0;
      if ((HEAPU8[$0_1 + 392 | 0] & 3) == 2) {
       break block3
      }
      $1_1 = $0_1 + 444 | 0;
      break block3;
     case 1:
      $1_1 = $0_1 + 444 | 0;
      if ((HEAPU8[$0_1 + 392 | 0] & 3) == 2) {
       break block3
      }
      $1_1 = $0_1 + 452 | 0;
      break block3;
     default:
      break block2;
     };
    }
    $1_1 = ($0_1 + (($1_1 & 255) << 2) | 0) + 444 | 0;
   }
   return +HEAPF32[$1_1 >> 2];
  }
  HEAP32[$2_1 >> 2] = 2158;
  $14($0_1, 5, 4824, $2_1);
  $6();
  wasm2js_trap();
 }
 
 function $182($0_1, $1_1) {
  $0_1 = $0_1 | 0;
  $1_1 = $1_1 | 0;
  var $2_1 = 0, $3_1 = 0;
  $2_1 = global$0 - 16 | 0;
  global$0 = $2_1;
  $0_1 = HEAP32[$0_1 >> 2];
  $3_1 = $1_1 & 255;
  if ($3_1 >>> 0 < 6) {
   global$0 = $2_1 + 16 | 0;
   block3 : {
    block2 : {
     switch ($3_1 - 4 | 0) {
     case 0:
      $1_1 = $0_1 + 436 | 0;
      if ((HEAPU8[$0_1 + 392 | 0] & 3) == 2) {
       break block3
      }
      $1_1 = $0_1 + 428 | 0;
      break block3;
     case 1:
      $1_1 = $0_1 + 428 | 0;
      if ((HEAPU8[$0_1 + 392 | 0] & 3) == 2) {
       break block3
      }
      $1_1 = $0_1 + 436 | 0;
      break block3;
     default:
      break block2;
     };
    }
    $1_1 = ($0_1 + (($1_1 & 255) << 2) | 0) + 428 | 0;
   }
   return +HEAPF32[$1_1 >> 2];
  }
  HEAP32[$2_1 >> 2] = 2158;
  $14($0_1, 5, 4824, $2_1);
  $6();
  wasm2js_trap();
 }
 
 function $183($0_1, $1_1) {
  $0_1 = $0_1 | 0;
  $1_1 = $1_1 | 0;
  $1_1 = HEAP32[$1_1 >> 2];
  HEAPF64[$0_1 >> 3] = HEAPF32[$1_1 + 412 >> 2];
  HEAPF64[$0_1 + 8 >> 3] = HEAPF32[$1_1 + 420 >> 2];
  HEAPF64[$0_1 + 16 >> 3] = HEAPF32[$1_1 + 416 >> 2];
  HEAPF64[$0_1 + 24 >> 3] = HEAPF32[$1_1 + 424 >> 2];
  HEAPF64[$0_1 + 32 >> 3] = HEAPF32[$1_1 + 396 >> 2];
  HEAPF64[$0_1 + 40 >> 3] = HEAPF32[$1_1 + 400 >> 2];
 }
 
 function $184($0_1) {
  $0_1 = $0_1 | 0;
  return +HEAPF32[HEAP32[$0_1 >> 2] + 400 >> 2];
 }
 
 function $185($0_1) {
  $0_1 = $0_1 | 0;
  return +HEAPF32[HEAP32[$0_1 >> 2] + 396 >> 2];
 }
 
 function $186($0_1) {
  $0_1 = $0_1 | 0;
  return +HEAPF32[HEAP32[$0_1 >> 2] + 424 >> 2];
 }
 
 function $187($0_1) {
  $0_1 = $0_1 | 0;
  return +HEAPF32[HEAP32[$0_1 >> 2] + 416 >> 2];
 }
 
 function $188($0_1) {
  $0_1 = $0_1 | 0;
  return +HEAPF32[HEAP32[$0_1 >> 2] + 420 >> 2];
 }
 
 function $189($0_1) {
  $0_1 = $0_1 | 0;
  return +HEAPF32[HEAP32[$0_1 >> 2] + 412 >> 2];
 }
 
 function $190($0_1, $1_1, $2_1, $3_1) {
  $0_1 = $0_1 | 0;
  $1_1 = +$1_1;
  $2_1 = +$2_1;
  $3_1 = $3_1 | 0;
  var $4_1 = Math_fround(0), $5_1 = 0, $6_1 = Math_fround(0), $7_1 = Math_fround(0), $8_1 = Math_fround(0), $9 = 0, $10_1 = 0, $11_1 = 0, $12_1 = 0, $13_1 = 0;
  $10_1 = global$0 + -64 | 0;
  global$0 = $10_1;
  $0_1 = HEAP32[$0_1 >> 2];
  $12($10_1 + 8 | 0, 0, 56);
  HEAP32[1884] = HEAP32[1884] + 1;
  $90($0_1);
  $5_1 = HEAPU8[$0_1 + 20 | 0] & 3;
  $5_1 = $5_1 ? $5_1 : $3_1 & 255 ? $3_1 : 1;
  $9 = $0_1 + 20 | 0;
  $4_1 = Math_fround($1_1);
  $6_1 = HEAPF32[$0_1 + 504 >> 2];
  block3 : {
   block2 : {
    block : {
     switch (HEAPU8[$0_1 + 508 | 0] - 1 | 0) {
     case 1:
      $6_1 = Math_fround(Math_fround($6_1 * $4_1) * Math_fround(.009999999776482582));
      break;
     case 0:
      break block;
     default:
      break block2;
     };
    }
    if (!($6_1 >= Math_fround(0.0))) {
     break block2
    }
    $6_1 = Math_fround($19($0_1, $5_1 & 255, 0, $4_1, $4_1) + Math_fround($4($9, 2, 1, $4_1) + $3($9, 2, 1, $4_1)));
    break block3;
   }
   $11_1 = $5_1 & 255;
   $6_1 = $15($9, $11_1, 0, $4_1, $4_1);
   if ($6_1 == $6_1) {
    $12_1 = 2;
    $6_1 = $15($9, $11_1, 0, $4_1, $4_1);
    break block3;
   }
   $12_1 = $4_1 != $4_1;
   $6_1 = $4_1;
  }
  $8_1 = Math_fround($2_1);
  $7_1 = HEAPF32[$0_1 + 512 >> 2];
  block7 : {
   block6 : {
    block4 : {
     switch (HEAPU8[$0_1 + 516 | 0] - 1 | 0) {
     case 1:
      $7_1 = Math_fround(Math_fround($7_1 * $8_1) * Math_fround(.009999999776482582));
      break;
     case 0:
      break block4;
     default:
      break block6;
     };
    }
    if (!($7_1 >= Math_fround(0.0))) {
     break block6
    }
    $7_1 = Math_fround($19($0_1, $5_1 & 255, 1, $8_1, $4_1) + Math_fround($4($9, 0, 1, $4_1) + $3($9, 0, 1, $4_1)));
    break block7;
   }
   $5_1 = $5_1 & 255;
   $7_1 = $15($9, $5_1, 1, $8_1, $4_1);
   if ($7_1 == $7_1) {
    $13_1 = 2;
    $7_1 = $15($9, $5_1, 1, $8_1, $4_1);
    break block7;
   }
   $13_1 = $8_1 != $8_1;
   $7_1 = $8_1;
  }
  if ($31($0_1, $6_1, $7_1, $3_1 & 255, $12_1, $13_1, $4_1, $8_1, 1, 0, $10_1 + 8 | 0, 0, HEAP32[1884])) {
   $88($0_1, HEAPU8[$0_1 + 392 | 0] & 3, $4_1, $8_1);
   $85($0_1, 0.0, 0.0);
  }
  global$0 = $10_1 - -64 | 0;
 }
 
 function $191($0_1) {
  $0_1 = $0_1 | 0;
  return HEAP8[HEAP32[$0_1 >> 2]] & 1;
 }
 
 function $192($0_1) {
  $0_1 = $0_1 | 0;
  $0_1 = HEAP32[$0_1 >> 2];
  HEAP8[$0_1 | 0] = HEAPU8[$0_1 | 0] & 254;
 }
 
 function $193($0_1) {
  $0_1 = $0_1 | 0;
  return (HEAPU8[HEAP32[$0_1 >> 2]] & 4) >>> 2 | 0;
 }
 
 function $194($0_1) {
  $0_1 = $0_1 | 0;
  var $1_1 = 0, $2_1 = 0;
  $2_1 = global$0 - 16 | 0;
  global$0 = $2_1;
  $0_1 = HEAP32[$0_1 >> 2];
  if (HEAP32[$0_1 + 8 >> 2]) {
   while (1) {
    $1_1 = HEAPU8[$0_1 | 0];
    if (!($1_1 & 4)) {
     HEAP8[$0_1 | 0] = $1_1 | 4;
     $1_1 = HEAP32[$0_1 + 16 >> 2];
     if ($1_1) {
      FUNCTION_TABLE[$1_1 | 0]($0_1)
     }
     HEAP32[$0_1 + 156 >> 2] = 2143289344;
     $0_1 = HEAP32[$0_1 + 484 >> 2];
     if ($0_1) {
      continue
     }
    }
    break;
   };
   global$0 = $2_1 + 16 | 0;
   return;
  }
  HEAP32[$2_1 >> 2] = 1024;
  $14($0_1, 5, 4824, $2_1);
  $6();
  wasm2js_trap();
 }
 
 function $195($0_1) {
  $0_1 = $0_1 | 0;
  var $1_1 = 0;
  $1_1 = HEAP32[$0_1 + 8 >> 2];
  HEAP32[$0_1 + 8 >> 2] = 0;
  if ($1_1) {
   FUNCTION_TABLE[HEAP32[HEAP32[$1_1 >> 2] + 4 >> 2]]($1_1)
  }
  HEAP32[HEAP32[$0_1 >> 2] + 16 >> 2] = 0;
 }
 
 function $196($0_1) {
  $0_1 = $0_1 | 0;
  $0_1 = HEAP32[HEAP32[$0_1 + 4 >> 2] + 8 >> 2];
  FUNCTION_TABLE[HEAP32[HEAP32[$0_1 >> 2] + 8 >> 2]]($0_1);
 }
 
 function $197($0_1, $1_1) {
  $0_1 = $0_1 | 0;
  $1_1 = $1_1 | 0;
  var $2_1 = 0;
  $2_1 = HEAP32[$0_1 + 8 >> 2];
  HEAP32[$0_1 + 8 >> 2] = $1_1;
  if ($2_1) {
   FUNCTION_TABLE[HEAP32[HEAP32[$2_1 >> 2] + 4 >> 2]]($2_1)
  }
  HEAP32[HEAP32[$0_1 >> 2] + 16 >> 2] = 5;
 }
 
 function $198($0_1) {
  $0_1 = $0_1 | 0;
  var $1_1 = 0;
  $1_1 = HEAP32[$0_1 + 4 >> 2];
  HEAP32[$0_1 + 4 >> 2] = 0;
  if ($1_1) {
   FUNCTION_TABLE[HEAP32[HEAP32[$1_1 >> 2] + 4 >> 2]]($1_1)
  }
  $0_1 = HEAP32[$0_1 >> 2];
  HEAP32[$0_1 + 8 >> 2] = 0;
  HEAP8[$0_1 | 0] = HEAPU8[$0_1 | 0] & 239;
 }
 
 function $199($0_1, $1_1, $2_1, $3_1, $4_1, $5_1) {
  $0_1 = $0_1 | 0;
  $1_1 = $1_1 | 0;
  $2_1 = Math_fround($2_1);
  $3_1 = $3_1 | 0;
  $4_1 = Math_fround($4_1);
  $5_1 = $5_1 | 0;
  var $6_1 = 0;
  $6_1 = global$0 - 16 | 0;
  global$0 = $6_1;
  $1_1 = HEAP32[HEAP32[$1_1 + 4 >> 2] + 4 >> 2];
  FUNCTION_TABLE[HEAP32[HEAP32[$1_1 >> 2] + 8 >> 2]]($6_1, $1_1, $2_1, $3_1, $4_1, $5_1);
  HEAPF32[$0_1 >> 2] = HEAPF64[$6_1 >> 3];
  HEAPF32[$0_1 + 4 >> 2] = HEAPF64[$6_1 + 8 >> 3];
  global$0 = $6_1 + 16 | 0;
 }
 
 function $200($0_1, $1_1) {
  $0_1 = $0_1 | 0;
  $1_1 = $1_1 | 0;
  var $2_1 = 0, $3_1 = 0;
  $2_1 = global$0 - 16 | 0;
  global$0 = $2_1;
  $3_1 = HEAP32[$0_1 + 4 >> 2];
  HEAP32[$0_1 + 4 >> 2] = $1_1;
  if ($3_1) {
   FUNCTION_TABLE[HEAP32[HEAP32[$3_1 >> 2] + 4 >> 2]]($3_1)
  }
  $0_1 = HEAP32[$0_1 >> 2];
  if (HEAP32[$0_1 + 488 >> 2] != HEAP32[$0_1 + 492 >> 2]) {
   HEAP32[$2_1 >> 2] = 4601;
   $14($0_1, 5, 4824, $2_1);
   $6();
   wasm2js_trap();
  }
  HEAP32[$0_1 + 8 >> 2] = 4;
  HEAP8[$0_1 | 0] = HEAPU8[$0_1 | 0] | 16;
  global$0 = $2_1 + 16 | 0;
 }
 
 function $201($0_1, $1_1) {
  $0_1 = $0_1 | 0;
  $1_1 = $1_1 | 0;
  var $2_1 = 0, $3_1 = 0;
  $2_1 = HEAP32[$0_1 >> 2];
  $0_1 = HEAP32[$2_1 + 488 >> 2];
  block : {
   if (HEAP32[$2_1 + 492 >> 2] - $0_1 >> 2 >>> 0 <= $1_1 >>> 0) {
    break block
   }
   $0_1 = HEAP32[$0_1 + ($1_1 << 2) >> 2];
   if (!$0_1) {
    break block
   }
   $3_1 = HEAP32[$0_1 + 4 >> 2];
  }
  return $3_1 | 0;
 }
 
 function $202($0_1) {
  $0_1 = $0_1 | 0;
  $0_1 = HEAP32[HEAP32[$0_1 >> 2] + 484 >> 2];
  if (!$0_1) {
   return 0
  }
  return HEAP32[$0_1 + 4 >> 2];
 }
 
 function $203($0_1) {
  $0_1 = $0_1 | 0;
  $0_1 = HEAP32[$0_1 >> 2];
  return HEAP32[$0_1 + 492 >> 2] - HEAP32[$0_1 + 488 >> 2] >> 2;
 }
 
 function $204($0_1, $1_1) {
  $0_1 = $0_1 | 0;
  $1_1 = $1_1 | 0;
  var $2_1 = 0, $3_1 = 0, $4_1 = 0;
  $2_1 = global$0 - 336 | 0;
  global$0 = $2_1;
  $0_1 = HEAP32[$0_1 >> 2];
  block : {
   if (HEAP32[$0_1 + 492 >> 2] == HEAP32[$0_1 + 488 >> 2]) {
    break block
   }
   $3_1 = HEAP32[$1_1 >> 2];
   $1_1 = HEAP32[$3_1 + 484 >> 2];
   if (!$81($0_1, $3_1)) {
    break block
   }
   if (($0_1 | 0) == ($1_1 | 0)) {
    $12($2_1 + 8 | 0, 0, 324);
    HEAP8[$2_1 + 24 | 0] = 0;
    HEAP32[$2_1 + 16 >> 2] = 0;
    HEAP32[$2_1 + 20 >> 2] = 0;
    HEAP32[$2_1 + 12 >> 2] = 2143289344;
    $12($2_1 + 28 | 0, 0, 196);
    $4_1 = $2_1 + 224 | 0;
    $1_1 = $2_1 + 32 | 0;
    while (1) {
     HEAP32[$1_1 + 16 >> 2] = -1082130432;
     HEAP32[$1_1 + 20 >> 2] = -1082130432;
     HEAP32[$1_1 + 8 >> 2] = 1;
     HEAP32[$1_1 + 12 >> 2] = 1;
     HEAP32[$1_1 >> 2] = -1082130432;
     HEAP32[$1_1 + 4 >> 2] = -1082130432;
     $1_1 = $1_1 + 24 | 0;
     if (($4_1 | 0) != ($1_1 | 0)) {
      continue
     }
     break;
    };
    HEAP32[$2_1 + 240 >> 2] = -1082130432;
    HEAP32[$2_1 + 244 >> 2] = -1082130432;
    HEAP32[$2_1 + 232 >> 2] = 1;
    HEAP32[$2_1 + 236 >> 2] = 1;
    HEAP32[$2_1 + 224 >> 2] = -1082130432;
    HEAP32[$2_1 + 228 >> 2] = -1082130432;
    HEAP32[$2_1 + 260 >> 2] = 2143289344;
    HEAP32[$2_1 + 264 >> 2] = 2143289344;
    HEAP32[$2_1 + 252 >> 2] = 2143289344;
    HEAP32[$2_1 + 256 >> 2] = 2143289344;
    HEAP8[$2_1 + 248 | 0] = HEAPU8[$2_1 + 248 | 0] & 248;
    $12($2_1 + 268 | 0, 0, 64);
    $13($3_1 + 152 | 0, $2_1 + 8 | 0, 324);
    HEAP32[$3_1 + 484 >> 2] = 0;
   }
   while (1) {
    $1_1 = HEAPU8[$0_1 | 0];
    if ($1_1 & 4) {
     break block
    }
    HEAP8[$0_1 | 0] = $1_1 | 4;
    $1_1 = HEAP32[$0_1 + 16 >> 2];
    if ($1_1) {
     FUNCTION_TABLE[$1_1 | 0]($0_1)
    }
    HEAP32[$0_1 + 156 >> 2] = 2143289344;
    $0_1 = HEAP32[$0_1 + 484 >> 2];
    if ($0_1) {
     continue
    }
    break;
   };
  }
  global$0 = $2_1 + 336 | 0;
 }
 
 function $205($0_1, $1_1, $2_1) {
  $0_1 = $0_1 | 0;
  $1_1 = $1_1 | 0;
  $2_1 = $2_1 | 0;
  var $3_1 = 0, $4_1 = 0, $5_1 = 0, $6_1 = 0, $7_1 = 0, $8_1 = 0, $9 = 0, $10_1 = 0, wasm2js_i32$0 = 0, wasm2js_i32$1 = 0;
  $7_1 = global$0 - 80 | 0;
  global$0 = $7_1;
  $0_1 = HEAP32[$0_1 >> 2];
  block2 : {
   block : {
    $8_1 = HEAP32[$1_1 >> 2];
    if (!HEAP32[$8_1 + 484 >> 2]) {
     if (HEAP32[$0_1 + 8 >> 2]) {
      break block
     }
     if ((HEAPU8[$8_1 + 23 | 0] << 16 & 786432) == 524288) {
      HEAP32[$0_1 + 480 >> 2] = HEAP32[$0_1 + 480 >> 2] + 1
     }
     $1_1 = HEAP32[$0_1 + 488 >> 2];
     $6_1 = $1_1 + ($2_1 << 2) | 0;
     $3_1 = HEAP32[$0_1 + 492 >> 2];
     $4_1 = $0_1 + 496 | 0;
     $5_1 = HEAP32[$4_1 >> 2];
     block1 : {
      if ($3_1 >>> 0 < $5_1 >>> 0) {
       if (($3_1 | 0) == ($6_1 | 0)) {
        HEAP32[$6_1 >> 2] = $8_1;
        HEAP32[$0_1 + 492 >> 2] = $6_1 + 4;
        break block1;
       }
       $2_1 = $3_1;
       $1_1 = $3_1 - 4 | 0;
       if ($3_1 >>> 0 > $1_1 >>> 0) {
        while (1) {
         HEAP32[$2_1 >> 2] = HEAP32[$1_1 >> 2];
         $2_1 = $2_1 + 4 | 0;
         $1_1 = $1_1 + 4 | 0;
         if ($3_1 >>> 0 > $1_1 >>> 0) {
          continue
         }
         break;
        }
       }
       HEAP32[$0_1 + 492 >> 2] = $2_1;
       $1_1 = $6_1 + 4 | 0;
       if (($1_1 | 0) != ($3_1 | 0)) {
        $1_1 = $3_1 - $1_1 | 0;
        $21($3_1 - ($1_1 & -4) | 0, $6_1, $1_1);
       }
       HEAP32[$6_1 >> 2] = $8_1;
       break block1;
      }
      $3_1 = ($3_1 - $1_1 >> 2) + 1 | 0;
      if ($3_1 >>> 0 >= 1073741824) {
       break block2
      }
      $1_1 = $5_1 - $1_1 | 0;
      $5_1 = $1_1 >> 1;
      $4_1 = $44($7_1 + 32 | 0, $1_1 >>> 0 >= 2147483644 ? 1073741823 : $3_1 >>> 0 < $5_1 >>> 0 ? $5_1 : $3_1, $2_1, $4_1);
      $2_1 = HEAP32[$4_1 + 8 >> 2];
      block3 : {
       if (($2_1 | 0) != HEAP32[$4_1 + 12 >> 2]) {
        break block3
       }
       $1_1 = HEAP32[$4_1 + 4 >> 2];
       $3_1 = HEAP32[$4_1 >> 2];
       if ($1_1 >>> 0 > $3_1 >>> 0) {
        $3_1 = (($1_1 - $3_1 >> 2) + 1 | 0) / -2 << 2;
        $9 = $3_1 + $1_1 | 0;
        $5_1 = $1_1;
        $1_1 = $2_1 - $1_1 | 0;
        $2_1 = $21($9, $5_1, $1_1) + $1_1 | 0;
        HEAP32[$4_1 + 8 >> 2] = $2_1;
        HEAP32[$4_1 + 4 >> 2] = $3_1 + HEAP32[$4_1 + 4 >> 2];
        break block3;
       }
       $1_1 = ($2_1 | 0) == ($3_1 | 0) ? 1 : $2_1 - $3_1 >> 1;
       $5_1 = $44($7_1 + 56 | 0, $1_1, $1_1 >>> 2 | 0, HEAP32[$4_1 + 16 >> 2]);
       $3_1 = HEAP32[$5_1 + 8 >> 2];
       $1_1 = HEAP32[$4_1 + 4 >> 2];
       $2_1 = HEAP32[$4_1 + 8 >> 2];
       block4 : {
        if (($1_1 | 0) == ($2_1 | 0)) {
         $2_1 = $3_1;
         $3_1 = $1_1;
         break block4;
        }
        $2_1 = ($2_1 - $1_1 | 0) + $3_1 | 0;
        while (1) {
         HEAP32[$3_1 >> 2] = HEAP32[$1_1 >> 2];
         $1_1 = $1_1 + 4 | 0;
         $3_1 = $3_1 + 4 | 0;
         if (($3_1 | 0) != ($2_1 | 0)) {
          continue
         }
         break;
        };
        $1_1 = HEAP32[$4_1 + 8 >> 2];
        $3_1 = HEAP32[$4_1 + 4 >> 2];
       }
       $9 = HEAP32[$4_1 >> 2];
       HEAP32[$4_1 >> 2] = HEAP32[$5_1 >> 2];
       HEAP32[$5_1 >> 2] = $9;
       HEAP32[$4_1 + 4 >> 2] = HEAP32[$5_1 + 4 >> 2];
       HEAP32[$5_1 + 4 >> 2] = $3_1;
       HEAP32[$4_1 + 8 >> 2] = $2_1;
       HEAP32[$5_1 + 8 >> 2] = $1_1;
       $10_1 = HEAP32[$4_1 + 12 >> 2];
       HEAP32[$4_1 + 12 >> 2] = HEAP32[$5_1 + 12 >> 2];
       HEAP32[$5_1 + 12 >> 2] = $10_1;
       if (($1_1 | 0) != ($3_1 | 0)) {
        HEAP32[$5_1 + 8 >> 2] = (($3_1 - $1_1 | 0) + 3 & -4) + $1_1
       }
       if (!$9) {
        break block3
       }
       $5($9);
       $2_1 = HEAP32[$4_1 + 8 >> 2];
      }
      HEAP32[$2_1 >> 2] = $8_1;
      HEAP32[$4_1 + 8 >> 2] = HEAP32[$4_1 + 8 >> 2] + 4;
      $1_1 = HEAP32[$0_1 + 488 >> 2];
      $2_1 = $6_1 - $1_1 | 0;
      (wasm2js_i32$0 = $4_1, wasm2js_i32$1 = $21(HEAP32[$4_1 + 4 >> 2] - $2_1 | 0, $1_1, $2_1)), HEAP32[wasm2js_i32$0 + 4 >> 2] = wasm2js_i32$1;
      $3_1 = HEAP32[$0_1 + 492 >> 2] - $6_1 | 0;
      $6_1 = $21(HEAP32[$4_1 + 8 >> 2], $6_1, $3_1);
      $1_1 = HEAP32[$0_1 + 488 >> 2];
      HEAP32[$0_1 + 488 >> 2] = HEAP32[$4_1 + 4 >> 2];
      HEAP32[$4_1 + 4 >> 2] = $1_1;
      $2_1 = HEAP32[$0_1 + 492 >> 2];
      HEAP32[$0_1 + 492 >> 2] = $3_1 + $6_1;
      HEAP32[$4_1 + 8 >> 2] = $2_1;
      $3_1 = HEAP32[$0_1 + 496 >> 2];
      HEAP32[$0_1 + 496 >> 2] = HEAP32[$4_1 + 12 >> 2];
      HEAP32[$4_1 >> 2] = $1_1;
      HEAP32[$4_1 + 12 >> 2] = $3_1;
      if (($1_1 | 0) != ($2_1 | 0)) {
       HEAP32[$4_1 + 8 >> 2] = $2_1 + (($1_1 - $2_1 | 0) + 3 & -4)
      }
      if (!$1_1) {
       break block1
      }
      $5($1_1);
     }
     HEAP32[$8_1 + 484 >> 2] = $0_1;
     while (1) {
      $1_1 = HEAPU8[$0_1 | 0];
      if (!($1_1 & 4)) {
       HEAP8[$0_1 | 0] = $1_1 | 4;
       $1_1 = HEAP32[$0_1 + 16 >> 2];
       if ($1_1) {
        FUNCTION_TABLE[$1_1 | 0]($0_1)
       }
       HEAP32[$0_1 + 156 >> 2] = 2143289344;
       $0_1 = HEAP32[$0_1 + 484 >> 2];
       if ($0_1) {
        continue
       }
      }
      break;
     };
     global$0 = $7_1 + 80 | 0;
     return;
    }
    HEAP32[$7_1 + 16 >> 2] = 4548;
    $14($0_1, 5, 4824, $7_1 + 16 | 0);
    $6();
    wasm2js_trap();
   }
   HEAP32[$7_1 >> 2] = 4681;
   $14($0_1, 5, 4824, $7_1);
   $6();
   wasm2js_trap();
  }
  fimport$2();
  wasm2js_trap();
 }
 
 function $206($0_1) {
  $0_1 = $0_1 | 0;
  return (HEAPU8[HEAP32[$0_1 >> 2]] & 2) >>> 1 | 0;
 }
 
 function $207($0_1, $1_1) {
  $0_1 = $0_1 | 0;
  $1_1 = $1_1 | 0;
  var $2_1 = 0, $3_1 = Math_fround(0);
  $2_1 = global$0 - 16 | 0;
  global$0 = $2_1;
  $0_1 = HEAP32[$0_1 >> 2];
  $1($2_1 + 8 | 0, $0_1 + 124 | 0, HEAPU16[($0_1 + (($1_1 & 255) << 1) | 0) + 104 >> 1]);
  $3_1 = Math_fround(NaN);
  block : {
   switch (HEAPU8[$2_1 + 12 | 0]) {
   default:
    $3_1 = HEAPF32[$2_1 + 8 >> 2];
    break;
   case 0:
   case 3:
    break block;
   };
  }
  global$0 = $2_1 + 16 | 0;
  return Math_fround($3_1);
 }
 
 function $208($0_1, $1_1, $2_1) {
  $0_1 = $0_1 | 0;
  $1_1 = $1_1 | 0;
  $2_1 = $2_1 | 0;
  var $3_1 = 0;
  $3_1 = global$0 - 16 | 0;
  global$0 = $3_1;
  $1_1 = HEAP32[$1_1 >> 2];
  $1($3_1 + 8 | 0, $1_1 + 124 | 0, HEAPU16[($1_1 + (($2_1 & 255) << 1) | 0) + 68 >> 1]);
  $1_1 = HEAPU8[$3_1 + 12 | 0];
  HEAPF64[$0_1 + 8 >> 3] = HEAPF32[$3_1 + 8 >> 2];
  HEAP32[$0_1 >> 2] = $1_1;
  global$0 = $3_1 + 16 | 0;
 }
 
 function $209($0_1, $1_1) {
  $0_1 = $0_1 | 0;
  $1_1 = $1_1 | 0;
  var $2_1 = 0, $3_1 = 0.0;
  $2_1 = global$0 - 16 | 0;
  global$0 = $2_1;
  $0_1 = HEAP32[$0_1 >> 2];
  $1($2_1 + 8 | 0, $0_1 + 124 | 0, HEAPU16[($0_1 + (($1_1 & 255) << 1) | 0) + 86 >> 1]);
  $3_1 = NaN;
  block : {
   switch (HEAPU8[$2_1 + 12 | 0]) {
   default:
    $3_1 = +HEAPF32[$2_1 + 8 >> 2];
    break;
   case 0:
   case 3:
    break block;
   };
  }
  global$0 = $2_1 + 16 | 0;
  return +$3_1;
 }
 
 function $210($0_1) {
  $0_1 = $0_1 | 0;
  var $1_1 = Math_fround(0);
  $0_1 = HEAP32[$0_1 >> 2];
  $1_1 = $2($0_1 + 124 | 0, HEAPU16[$0_1 + 122 >> 1]);
  return +($1_1 != $1_1 ? Math_fround(NaN) : $1_1);
 }
 
 function $211($0_1, $1_1) {
  $0_1 = $0_1 | 0;
  $1_1 = $1_1 | 0;
  var $2_1 = 0;
  $2_1 = global$0 - 16 | 0;
  global$0 = $2_1;
  $1_1 = HEAP32[$1_1 >> 2];
  $1($2_1 + 8 | 0, $1_1 + 124 | 0, HEAPU16[$1_1 + 120 >> 1]);
  $1_1 = HEAPU8[$2_1 + 12 | 0];
  HEAPF64[$0_1 + 8 >> 3] = HEAPF32[$2_1 + 8 >> 2];
  HEAP32[$0_1 >> 2] = $1_1;
  global$0 = $2_1 + 16 | 0;
 }
 
 function $212($0_1, $1_1) {
  $0_1 = $0_1 | 0;
  $1_1 = $1_1 | 0;
  var $2_1 = 0;
  $2_1 = global$0 - 16 | 0;
  global$0 = $2_1;
  $1_1 = HEAP32[$1_1 >> 2];
  $1($2_1 + 8 | 0, $1_1 + 124 | 0, HEAPU16[$1_1 + 118 >> 1]);
  $1_1 = HEAPU8[$2_1 + 12 | 0];
  HEAPF64[$0_1 + 8 >> 3] = HEAPF32[$2_1 + 8 >> 2];
  HEAP32[$0_1 >> 2] = $1_1;
  global$0 = $2_1 + 16 | 0;
 }
 
 function $213($0_1, $1_1) {
  $0_1 = $0_1 | 0;
  $1_1 = $1_1 | 0;
  var $2_1 = 0;
  $2_1 = global$0 - 16 | 0;
  global$0 = $2_1;
  $1_1 = HEAP32[$1_1 >> 2];
  $1($2_1 + 8 | 0, $1_1 + 124 | 0, HEAPU16[$1_1 + 116 >> 1]);
  $1_1 = HEAPU8[$2_1 + 12 | 0];
  HEAPF64[$0_1 + 8 >> 3] = HEAPF32[$2_1 + 8 >> 2];
  HEAP32[$0_1 >> 2] = $1_1;
  global$0 = $2_1 + 16 | 0;
 }
 
 function $214($0_1, $1_1) {
  $0_1 = $0_1 | 0;
  $1_1 = $1_1 | 0;
  var $2_1 = 0;
  $2_1 = global$0 - 16 | 0;
  global$0 = $2_1;
  $1_1 = HEAP32[$1_1 >> 2];
  $1($2_1 + 8 | 0, $1_1 + 124 | 0, HEAPU16[$1_1 + 114 >> 1]);
  $1_1 = HEAPU8[$2_1 + 12 | 0];
  HEAPF64[$0_1 + 8 >> 3] = HEAPF32[$2_1 + 8 >> 2];
  HEAP32[$0_1 >> 2] = $1_1;
  global$0 = $2_1 + 16 | 0;
 }
 
 function $215($0_1, $1_1) {
  $0_1 = $0_1 | 0;
  $1_1 = $1_1 | 0;
  var $2_1 = 0;
  $2_1 = global$0 - 16 | 0;
  global$0 = $2_1;
  $1_1 = HEAP32[$1_1 >> 2];
  $1($2_1 + 8 | 0, $1_1 + 124 | 0, HEAPU16[$1_1 + 112 >> 1]);
  $1_1 = HEAPU8[$2_1 + 12 | 0];
  HEAPF64[$0_1 + 8 >> 3] = HEAPF32[$2_1 + 8 >> 2];
  HEAP32[$0_1 >> 2] = $1_1;
  global$0 = $2_1 + 16 | 0;
 }
 
 function $216($0_1, $1_1) {
  $0_1 = $0_1 | 0;
  $1_1 = $1_1 | 0;
  var $2_1 = 0;
  $2_1 = global$0 - 16 | 0;
  global$0 = $2_1;
  $1_1 = HEAP32[$1_1 >> 2];
  $1($2_1 + 8 | 0, $1_1 + 124 | 0, HEAPU16[$1_1 + 110 >> 1]);
  $1_1 = HEAPU8[$2_1 + 12 | 0];
  HEAPF64[$0_1 + 8 >> 3] = HEAPF32[$2_1 + 8 >> 2];
  HEAP32[$0_1 >> 2] = $1_1;
  global$0 = $2_1 + 16 | 0;
 }
 
 function $217($0_1) {
  $0_1 = $0_1 | 0;
  var $1_1 = Math_fround(0), $2_1 = 0;
  $0_1 = HEAP32[$0_1 >> 2];
  $2_1 = $0_1 + 124 | 0;
  $1_1 = $2($2_1, HEAPU16[$0_1 + 28 >> 1]);
  block : {
   if ($1_1 != $1_1) {
    $1_1 = HEAP8[HEAP32[$0_1 + 500 >> 2] + 8 | 0] & 1 ? Math_fround(1.0) : Math_fround(0.0);
    break block;
   }
   $1_1 = $2($2_1, HEAPU16[$0_1 + 28 >> 1]);
  }
  return +$1_1;
 }
 
 function $218($0_1) {
  $0_1 = $0_1 | 0;
  var $1_1 = 0, $2_1 = Math_fround(0);
  $0_1 = HEAP32[$0_1 >> 2];
  $1_1 = $0_1 + 124 | 0;
  $2_1 = $2($1_1, HEAPU16[$0_1 + 26 >> 1]);
  if ($2_1 != $2_1) {
   return 0.0
  }
  return +$2($1_1, HEAPU16[$0_1 + 26 >> 1]);
 }
 
 function $219($0_1, $1_1) {
  $0_1 = $0_1 | 0;
  $1_1 = $1_1 | 0;
  var $2_1 = 0;
  $2_1 = global$0 - 16 | 0;
  global$0 = $2_1;
  $1_1 = HEAP32[$1_1 >> 2];
  $1($2_1 + 8 | 0, $1_1 + 124 | 0, HEAPU16[$1_1 + 30 >> 1]);
  $1_1 = HEAPU8[$2_1 + 12 | 0];
  HEAPF64[$0_1 + 8 >> 3] = HEAPF32[$2_1 + 8 >> 2];
  HEAP32[$0_1 >> 2] = $1_1;
  global$0 = $2_1 + 16 | 0;
 }
 
 function $220($0_1) {
  $0_1 = $0_1 | 0;
  return HEAPU8[HEAP32[$0_1 >> 2] + 23 | 0] >>> 2 & 3;
 }
 
 function $221($0_1) {
  $0_1 = $0_1 | 0;
  return HEAPU8[HEAP32[$0_1 >> 2] + 23 | 0] & 3;
 }
 
 function $222($0_1, $1_1, $2_1) {
  $0_1 = $0_1 | 0;
  $1_1 = $1_1 | 0;
  $2_1 = $2_1 | 0;
  var $3_1 = 0;
  $3_1 = global$0 - 16 | 0;
  global$0 = $3_1;
  $1_1 = HEAP32[$1_1 >> 2];
  $1($3_1 + 8 | 0, $1_1 + 124 | 0, HEAPU16[($1_1 + (($2_1 & 255) << 1) | 0) + 32 >> 1]);
  $1_1 = HEAPU8[$3_1 + 12 | 0];
  HEAPF64[$0_1 + 8 >> 3] = HEAPF32[$3_1 + 8 >> 2];
  HEAP32[$0_1 >> 2] = $1_1;
  global$0 = $3_1 + 16 | 0;
 }
 
 function $223($0_1) {
  $0_1 = $0_1 | 0;
  return HEAPU8[HEAP32[$0_1 >> 2] + 20 | 0] >>> 4 & 7;
 }
 
 function $224($0_1) {
  $0_1 = $0_1 | 0;
  $0_1 = HEAP32[$0_1 >> 2];
  return (HEAPU8[$0_1 + 21 | 0] | HEAPU8[$0_1 + 22 | 0] << 8) >>> 14 | 0;
 }
 
 function $225($0_1) {
  $0_1 = $0_1 | 0;
  return HEAPU8[HEAP32[$0_1 >> 2] + 20 | 0] & 3;
 }
 
 function $226($0_1) {
  $0_1 = $0_1 | 0;
  return HEAPU8[HEAP32[$0_1 >> 2] + 20 | 0] >>> 2 & 3;
 }
 
 function $227($0_1) {
  $0_1 = $0_1 | 0;
  $0_1 = HEAP32[$0_1 >> 2];
  return (HEAPU8[$0_1 + 22 | 0] | HEAPU8[$0_1 + 23 | 0] << 8) & 15;
 }
 
 function $228($0_1) {
  $0_1 = $0_1 | 0;
  $0_1 = HEAP32[$0_1 >> 2];
  return (HEAPU8[$0_1 + 21 | 0] | HEAPU8[$0_1 + 22 | 0] << 8) >>> 4 & 15;
 }
 
 function $229($0_1) {
  $0_1 = $0_1 | 0;
  $0_1 = HEAP32[$0_1 >> 2];
  return (HEAPU8[$0_1 + 21 | 0] | HEAPU8[$0_1 + 22 | 0] << 8) & 15;
 }
 
 function $230($0_1, $1_1, $2_1) {
  $0_1 = $0_1 | 0;
  $1_1 = $1_1 | 0;
  $2_1 = $2_1 | 0;
  var $3_1 = 0;
  $3_1 = global$0 - 16 | 0;
  global$0 = $3_1;
  $1_1 = HEAP32[$1_1 >> 2];
  $1($3_1 + 8 | 0, $1_1 + 124 | 0, HEAPU16[($1_1 + (($2_1 & 255) << 1) | 0) + 50 >> 1]);
  $1_1 = HEAPU8[$3_1 + 12 | 0];
  HEAPF64[$0_1 + 8 >> 3] = HEAPF32[$3_1 + 8 >> 2];
  HEAP32[$0_1 >> 2] = $1_1;
  global$0 = $3_1 + 16 | 0;
 }
 
 function $231($0_1) {
  $0_1 = $0_1 | 0;
  $0_1 = HEAP32[$0_1 >> 2];
  return (HEAPU8[$0_1 + 21 | 0] | HEAPU8[$0_1 + 22 | 0] << 8) >>> 12 & 3;
 }
 
 function $232($0_1) {
  $0_1 = $0_1 | 0;
  return HEAPU8[HEAP32[$0_1 >> 2] + 23 | 0] >>> 4 & 1;
 }
 
 function $233($0_1, $1_1, $2_1) {
  $0_1 = $0_1 | 0;
  $1_1 = $1_1 | 0;
  $2_1 = +$2_1;
  var $3_1 = 0, $4_1 = Math_fround(0), $5_1 = 0, $6_1 = 0;
  $3_1 = global$0 - 16 | 0;
  global$0 = $3_1;
  $6_1 = HEAP32[$0_1 >> 2];
  $4_1 = Math_fround($2_1);
  block : {
   if ($4_1 != $4_1) {
    $0_1 = 0;
    $4_1 = Math_fround(NaN);
    break block;
   }
   $5_1 = $4_1 == Math_fround(Infinity) | $4_1 == Math_fround(-Infinity);
   $0_1 = $5_1 ? 0 : 2;
   $4_1 = $5_1 ? Math_fround(NaN) : $4_1;
  }
  HEAP8[$3_1 + 12 | 0] = $0_1;
  HEAPF32[$3_1 + 8 >> 2] = $4_1;
  $0_1 = HEAP32[$3_1 + 12 >> 2];
  HEAP32[$3_1 >> 2] = HEAP32[$3_1 + 8 >> 2];
  HEAP32[$3_1 + 4 >> 2] = $0_1;
  $106($6_1, $1_1 & 255, $3_1);
  global$0 = $3_1 + 16 | 0;
 }
 
 function $234($0_1, $1_1, $2_1) {
  $0_1 = $0_1 | 0;
  $1_1 = $1_1 | 0;
  $2_1 = +$2_1;
  var $3_1 = 0, $4_1 = Math_fround(0), $5_1 = 0;
  $3_1 = global$0 - 16 | 0;
  global$0 = $3_1;
  $5_1 = HEAP32[$0_1 >> 2];
  $4_1 = Math_fround($2_1);
  block : {
   if ($4_1 != $4_1) {
    $4_1 = Math_fround(NaN);
    $0_1 = 0;
    break block;
   }
   $0_1 = $4_1 == Math_fround(Infinity) | $4_1 == Math_fround(-Infinity);
   $4_1 = $0_1 ? Math_fround(NaN) : $4_1;
   $0_1 = !$0_1;
  }
  HEAP8[$3_1 + 12 | 0] = $0_1;
  HEAPF32[$3_1 + 8 >> 2] = $4_1;
  $0_1 = HEAP32[$3_1 + 12 >> 2];
  HEAP32[$3_1 >> 2] = HEAP32[$3_1 + 8 >> 2];
  HEAP32[$3_1 + 4 >> 2] = $0_1;
  $106($5_1, $1_1 & 255, $3_1);
  global$0 = $3_1 + 16 | 0;
 }
 
 function $235($0_1, $1_1) {
  $0_1 = $0_1 | 0;
  $1_1 = $1_1 | 0;
  var $2_1 = 0;
  block : {
   $0_1 = HEAP32[$0_1 >> 2];
   $2_1 = HEAPU8[$0_1 | 0];
   if ((($2_1 & 2) >>> 1 | 0) == ($1_1 | 0)) {
    break block
   }
   HEAP8[$0_1 | 0] = $2_1 & 253 | ($1_1 ? 2 : 0);
   while (1) {
    $1_1 = HEAPU8[$0_1 | 0];
    if ($1_1 & 4) {
     break block
    }
    HEAP8[$0_1 | 0] = $1_1 | 4;
    $1_1 = HEAP32[$0_1 + 16 >> 2];
    if ($1_1) {
     FUNCTION_TABLE[$1_1 | 0]($0_1)
    }
    HEAP32[$0_1 + 156 >> 2] = 2143289344;
    $0_1 = HEAP32[$0_1 + 484 >> 2];
    if ($0_1) {
     continue
    }
    break;
   };
  }
 }
 
 function $236($0_1, $1_1, $2_1) {
  $0_1 = $0_1 | 0;
  $1_1 = $1_1 | 0;
  $2_1 = +$2_1;
  var $3_1 = 0, $4_1 = Math_fround(0), $5_1 = 0, $6_1 = 0;
  $3_1 = global$0 - 16 | 0;
  global$0 = $3_1;
  $6_1 = HEAP32[$0_1 >> 2];
  $4_1 = Math_fround($2_1);
  block : {
   if ($4_1 != $4_1) {
    $0_1 = 0;
    $4_1 = Math_fround(NaN);
    break block;
   }
   $5_1 = $4_1 == Math_fround(Infinity) | $4_1 == Math_fround(-Infinity);
   $0_1 = $5_1 ? 0 : 2;
   $4_1 = $5_1 ? Math_fround(NaN) : $4_1;
  }
  HEAP8[$3_1 + 12 | 0] = $0_1;
  HEAPF32[$3_1 + 8 >> 2] = $4_1;
  $0_1 = HEAP32[$3_1 + 12 >> 2];
  HEAP32[$3_1 >> 2] = HEAP32[$3_1 + 8 >> 2];
  HEAP32[$3_1 + 4 >> 2] = $0_1;
  $112($6_1, $1_1 & 255, $3_1);
  global$0 = $3_1 + 16 | 0;
 }
 
 function $237($0_1, $1_1, $2_1) {
  $0_1 = $0_1 | 0;
  $1_1 = $1_1 | 0;
  $2_1 = +$2_1;
  var $3_1 = 0, $4_1 = Math_fround(0), $5_1 = 0;
  $3_1 = global$0 - 16 | 0;
  global$0 = $3_1;
  $5_1 = HEAP32[$0_1 >> 2];
  $4_1 = Math_fround($2_1);
  block : {
   if ($4_1 != $4_1) {
    $4_1 = Math_fround(NaN);
    $0_1 = 0;
    break block;
   }
   $0_1 = $4_1 == Math_fround(Infinity) | $4_1 == Math_fround(-Infinity);
   $4_1 = $0_1 ? Math_fround(NaN) : $4_1;
   $0_1 = !$0_1;
  }
  HEAP8[$3_1 + 12 | 0] = $0_1;
  HEAPF32[$3_1 + 8 >> 2] = $4_1;
  $0_1 = HEAP32[$3_1 + 12 >> 2];
  HEAP32[$3_1 >> 2] = HEAP32[$3_1 + 8 >> 2];
  HEAP32[$3_1 + 4 >> 2] = $0_1;
  $112($5_1, $1_1 & 255, $3_1);
  global$0 = $3_1 + 16 | 0;
 }
 
 function $238($0_1, $1_1, $2_1) {
  $0_1 = $0_1 | 0;
  $1_1 = $1_1 | 0;
  $2_1 = +$2_1;
  var $3_1 = Math_fround(0), $4_1 = 0, $5_1 = 0, $6_1 = Math_fround(0), $7_1 = 0, $8_1 = 0;
  $5_1 = global$0 - 16 | 0;
  global$0 = $5_1;
  $0_1 = HEAP32[$0_1 >> 2];
  $3_1 = Math_fround($2_1);
  block : {
   if ($3_1 != $3_1) {
    $3_1 = Math_fround(NaN);
    $4_1 = 0;
    break block;
   }
   $4_1 = $3_1 == Math_fround(Infinity) | $3_1 == Math_fround(-Infinity);
   $3_1 = $4_1 ? Math_fround(NaN) : $3_1;
   $4_1 = !$4_1;
  }
  $7_1 = $0_1 + 124 | 0;
  $1_1 = ((($1_1 & 255) << 1) + $0_1 | 0) + 86 | 0;
  $1($5_1 + 8 | 0, $7_1, HEAPU16[$1_1 >> 1]);
  $6_1 = HEAPF32[$5_1 + 8 >> 2];
  block2 : {
   block1 : {
    if ($6_1 != $3_1) {
     if ($6_1 == $6_1) {
      break block1
     }
     $8_1 = $3_1 != $3_1;
    } else {
     $8_1 = 1
    }
    if (!$8_1) {
     break block1
    }
    if (($4_1 | 0) == HEAPU8[$5_1 + 12 | 0]) {
     break block2
    }
   }
   $27($7_1, $1_1, $3_1, $4_1);
   while (1) {
    $1_1 = HEAPU8[$0_1 | 0];
    if ($1_1 & 4) {
     break block2
    }
    HEAP8[$0_1 | 0] = $1_1 | 4;
    $1_1 = HEAP32[$0_1 + 16 >> 2];
    if ($1_1) {
     FUNCTION_TABLE[$1_1 | 0]($0_1)
    }
    HEAP32[$0_1 + 156 >> 2] = 2143289344;
    $0_1 = HEAP32[$0_1 + 484 >> 2];
    if ($0_1) {
     continue
    }
    break;
   };
  }
  global$0 = $5_1 + 16 | 0;
 }
 
 function $239($0_1, $1_1) {
  $0_1 = $0_1 | 0;
  $1_1 = +$1_1;
  var $2_1 = 0, $3_1 = Math_fround(0), $4_1 = Math_fround(0), $5_1 = 0, $6_1 = 0;
  block : {
   $3_1 = Math_fround($1_1);
   $0_1 = HEAP32[$0_1 >> 2];
   $5_1 = $0_1 + 124 | 0;
   $2_1 = $0_1 + 122 | 0;
   $4_1 = $2($5_1, HEAPU16[$2_1 >> 1]);
   if ($3_1 == $4_1) {
    break block
   }
   $6_1 = $3_1 == $3_1;
   if (!$6_1 & $4_1 != $4_1) {
    break block
   }
   block1 : {
    if (!(!($3_1 == Math_fround(0.0) | Math_fround(Math_abs($3_1)) == Math_fround(Infinity)) & $6_1)) {
     HEAP16[$2_1 >> 1] = HEAPU16[$2_1 >> 1] & 65528;
     break block1;
    }
    $46($5_1, $2_1, $3_1, 3);
   }
   while (1) {
    $2_1 = HEAPU8[$0_1 | 0];
    if ($2_1 & 4) {
     break block
    }
    HEAP8[$0_1 | 0] = $2_1 | 4;
    $2_1 = HEAP32[$0_1 + 16 >> 2];
    if ($2_1) {
     FUNCTION_TABLE[$2_1 | 0]($0_1)
    }
    HEAP32[$0_1 + 156 >> 2] = 2143289344;
    $0_1 = HEAP32[$0_1 + 484 >> 2];
    if ($0_1) {
     continue
    }
    break;
   };
  }
 }
 
 function $240($0_1, $1_1) {
  $0_1 = $0_1 | 0;
  $1_1 = +$1_1;
  var $2_1 = 0, $3_1 = Math_fround(0), $4_1 = 0, $5_1 = 0;
  $2_1 = global$0 - 16 | 0;
  global$0 = $2_1;
  $5_1 = HEAP32[$0_1 >> 2];
  $3_1 = Math_fround($1_1);
  block : {
   if ($3_1 != $3_1) {
    $0_1 = 0;
    $3_1 = Math_fround(NaN);
    break block;
   }
   $4_1 = $3_1 == Math_fround(Infinity) | $3_1 == Math_fround(-Infinity);
   $0_1 = $4_1 ? 0 : 2;
   $3_1 = $4_1 ? Math_fround(NaN) : $3_1;
  }
  HEAP8[$2_1 + 12 | 0] = $0_1;
  HEAPF32[$2_1 + 8 >> 2] = $3_1;
  $0_1 = HEAP32[$2_1 + 12 >> 2];
  HEAP32[$2_1 >> 2] = HEAP32[$2_1 + 8 >> 2];
  HEAP32[$2_1 + 4 >> 2] = $0_1;
  $55($5_1, 1, $2_1);
  global$0 = $2_1 + 16 | 0;
 }
 
 function $241($0_1, $1_1) {
  $0_1 = $0_1 | 0;
  $1_1 = +$1_1;
  var $2_1 = 0, $3_1 = Math_fround(0), $4_1 = 0;
  $2_1 = global$0 - 16 | 0;
  global$0 = $2_1;
  $4_1 = HEAP32[$0_1 >> 2];
  $3_1 = Math_fround($1_1);
  block : {
   if ($3_1 != $3_1) {
    $3_1 = Math_fround(NaN);
    $0_1 = 0;
    break block;
   }
   $0_1 = $3_1 == Math_fround(Infinity) | $3_1 == Math_fround(-Infinity);
   $3_1 = $0_1 ? Math_fround(NaN) : $3_1;
   $0_1 = !$0_1;
  }
  HEAP8[$2_1 + 12 | 0] = $0_1;
  HEAPF32[$2_1 + 8 >> 2] = $3_1;
  $0_1 = HEAP32[$2_1 + 12 >> 2];
  HEAP32[$2_1 >> 2] = HEAP32[$2_1 + 8 >> 2];
  HEAP32[$2_1 + 4 >> 2] = $0_1;
  $55($4_1, 1, $2_1);
  global$0 = $2_1 + 16 | 0;
 }
 
 function $242($0_1, $1_1) {
  $0_1 = $0_1 | 0;
  $1_1 = +$1_1;
  var $2_1 = 0, $3_1 = Math_fround(0), $4_1 = 0, $5_1 = 0;
  $2_1 = global$0 - 16 | 0;
  global$0 = $2_1;
  $5_1 = HEAP32[$0_1 >> 2];
  $3_1 = Math_fround($1_1);
  block : {
   if ($3_1 != $3_1) {
    $0_1 = 0;
    $3_1 = Math_fround(NaN);
    break block;
   }
   $4_1 = $3_1 == Math_fround(Infinity) | $3_1 == Math_fround(-Infinity);
   $0_1 = $4_1 ? 0 : 2;
   $3_1 = $4_1 ? Math_fround(NaN) : $3_1;
  }
  HEAP8[$2_1 + 12 | 0] = $0_1;
  HEAPF32[$2_1 + 8 >> 2] = $3_1;
  $0_1 = HEAP32[$2_1 + 12 >> 2];
  HEAP32[$2_1 >> 2] = HEAP32[$2_1 + 8 >> 2];
  HEAP32[$2_1 + 4 >> 2] = $0_1;
  $55($5_1, 0, $2_1);
  global$0 = $2_1 + 16 | 0;
 }
 
 function $243($0_1, $1_1) {
  $0_1 = $0_1 | 0;
  $1_1 = +$1_1;
  var $2_1 = 0, $3_1 = Math_fround(0), $4_1 = 0;
  $2_1 = global$0 - 16 | 0;
  global$0 = $2_1;
  $4_1 = HEAP32[$0_1 >> 2];
  $3_1 = Math_fround($1_1);
  block : {
   if ($3_1 != $3_1) {
    $3_1 = Math_fround(NaN);
    $0_1 = 0;
    break block;
   }
   $0_1 = $3_1 == Math_fround(Infinity) | $3_1 == Math_fround(-Infinity);
   $3_1 = $0_1 ? Math_fround(NaN) : $3_1;
   $0_1 = !$0_1;
  }
  HEAP8[$2_1 + 12 | 0] = $0_1;
  HEAPF32[$2_1 + 8 >> 2] = $3_1;
  $0_1 = HEAP32[$2_1 + 12 >> 2];
  HEAP32[$2_1 >> 2] = HEAP32[$2_1 + 8 >> 2];
  HEAP32[$2_1 + 4 >> 2] = $0_1;
  $55($4_1, 0, $2_1);
  global$0 = $2_1 + 16 | 0;
 }
 
 function $244($0_1, $1_1) {
  $0_1 = $0_1 | 0;
  $1_1 = +$1_1;
  var $2_1 = 0, $3_1 = Math_fround(0), $4_1 = 0, $5_1 = 0;
  $2_1 = global$0 - 16 | 0;
  global$0 = $2_1;
  $5_1 = HEAP32[$0_1 >> 2];
  $3_1 = Math_fround($1_1);
  block : {
   if ($3_1 != $3_1) {
    $0_1 = 0;
    $3_1 = Math_fround(NaN);
    break block;
   }
   $4_1 = $3_1 == Math_fround(Infinity) | $3_1 == Math_fround(-Infinity);
   $0_1 = $4_1 ? 0 : 2;
   $3_1 = $4_1 ? Math_fround(NaN) : $3_1;
  }
  HEAP8[$2_1 + 12 | 0] = $0_1;
  HEAPF32[$2_1 + 8 >> 2] = $3_1;
  $0_1 = HEAP32[$2_1 + 12 >> 2];
  HEAP32[$2_1 >> 2] = HEAP32[$2_1 + 8 >> 2];
  HEAP32[$2_1 + 4 >> 2] = $0_1;
  $56($5_1, 1, $2_1);
  global$0 = $2_1 + 16 | 0;
 }
 
 function $245($0_1, $1_1) {
  $0_1 = $0_1 | 0;
  $1_1 = +$1_1;
  var $2_1 = 0, $3_1 = Math_fround(0), $4_1 = 0;
  $2_1 = global$0 - 16 | 0;
  global$0 = $2_1;
  $4_1 = HEAP32[$0_1 >> 2];
  $3_1 = Math_fround($1_1);
  block : {
   if ($3_1 != $3_1) {
    $3_1 = Math_fround(NaN);
    $0_1 = 0;
    break block;
   }
   $0_1 = $3_1 == Math_fround(Infinity) | $3_1 == Math_fround(-Infinity);
   $3_1 = $0_1 ? Math_fround(NaN) : $3_1;
   $0_1 = !$0_1;
  }
  HEAP8[$2_1 + 12 | 0] = $0_1;
  HEAPF32[$2_1 + 8 >> 2] = $3_1;
  $0_1 = HEAP32[$2_1 + 12 >> 2];
  HEAP32[$2_1 >> 2] = HEAP32[$2_1 + 8 >> 2];
  HEAP32[$2_1 + 4 >> 2] = $0_1;
  $56($4_1, 1, $2_1);
  global$0 = $2_1 + 16 | 0;
 }
 
 function $246($0_1, $1_1) {
  $0_1 = $0_1 | 0;
  $1_1 = +$1_1;
  var $2_1 = 0, $3_1 = Math_fround(0), $4_1 = 0, $5_1 = 0;
  $2_1 = global$0 - 16 | 0;
  global$0 = $2_1;
  $5_1 = HEAP32[$0_1 >> 2];
  $3_1 = Math_fround($1_1);
  block : {
   if ($3_1 != $3_1) {
    $0_1 = 0;
    $3_1 = Math_fround(NaN);
    break block;
   }
   $4_1 = $3_1 == Math_fround(Infinity) | $3_1 == Math_fround(-Infinity);
   $0_1 = $4_1 ? 0 : 2;
   $3_1 = $4_1 ? Math_fround(NaN) : $3_1;
  }
  HEAP8[$2_1 + 12 | 0] = $0_1;
  HEAPF32[$2_1 + 8 >> 2] = $3_1;
  $0_1 = HEAP32[$2_1 + 12 >> 2];
  HEAP32[$2_1 >> 2] = HEAP32[$2_1 + 8 >> 2];
  HEAP32[$2_1 + 4 >> 2] = $0_1;
  $56($5_1, 0, $2_1);
  global$0 = $2_1 + 16 | 0;
 }
 
 function $247($0_1, $1_1) {
  $0_1 = $0_1 | 0;
  $1_1 = +$1_1;
  var $2_1 = 0, $3_1 = Math_fround(0), $4_1 = 0;
  $2_1 = global$0 - 16 | 0;
  global$0 = $2_1;
  $4_1 = HEAP32[$0_1 >> 2];
  $3_1 = Math_fround($1_1);
  block : {
   if ($3_1 != $3_1) {
    $3_1 = Math_fround(NaN);
    $0_1 = 0;
    break block;
   }
   $0_1 = $3_1 == Math_fround(Infinity) | $3_1 == Math_fround(-Infinity);
   $3_1 = $0_1 ? Math_fround(NaN) : $3_1;
   $0_1 = !$0_1;
  }
  HEAP8[$2_1 + 12 | 0] = $0_1;
  HEAPF32[$2_1 + 8 >> 2] = $3_1;
  $0_1 = HEAP32[$2_1 + 12 >> 2];
  HEAP32[$2_1 >> 2] = HEAP32[$2_1 + 8 >> 2];
  HEAP32[$2_1 + 4 >> 2] = $0_1;
  $56($4_1, 0, $2_1);
  global$0 = $2_1 + 16 | 0;
 }
 
 function $248($0_1) {
  $0_1 = $0_1 | 0;
  var $1_1 = 0, $2_1 = 0;
  $1_1 = global$0 - 16 | 0;
  global$0 = $1_1;
  $0_1 = HEAP32[$0_1 >> 2];
  HEAP8[$1_1 + 12 | 0] = 3;
  HEAP32[$1_1 + 8 >> 2] = 2143289344;
  $2_1 = HEAP32[$1_1 + 12 >> 2];
  HEAP32[$1_1 >> 2] = HEAP32[$1_1 + 8 >> 2];
  HEAP32[$1_1 + 4 >> 2] = $2_1;
  $40($0_1, 1, $1_1);
  global$0 = $1_1 + 16 | 0;
 }
 
 function $249($0_1, $1_1) {
  $0_1 = $0_1 | 0;
  $1_1 = +$1_1;
  var $2_1 = 0, $3_1 = Math_fround(0), $4_1 = 0, $5_1 = 0;
  $2_1 = global$0 - 16 | 0;
  global$0 = $2_1;
  $5_1 = HEAP32[$0_1 >> 2];
  $3_1 = Math_fround($1_1);
  block : {
   if ($3_1 != $3_1) {
    $0_1 = 0;
    $3_1 = Math_fround(NaN);
    break block;
   }
   $4_1 = $3_1 == Math_fround(Infinity) | $3_1 == Math_fround(-Infinity);
   $0_1 = $4_1 ? 0 : 2;
   $3_1 = $4_1 ? Math_fround(NaN) : $3_1;
  }
  HEAP8[$2_1 + 12 | 0] = $0_1;
  HEAPF32[$2_1 + 8 >> 2] = $3_1;
  $0_1 = HEAP32[$2_1 + 12 >> 2];
  HEAP32[$2_1 >> 2] = HEAP32[$2_1 + 8 >> 2];
  HEAP32[$2_1 + 4 >> 2] = $0_1;
  $40($5_1, 1, $2_1);
  global$0 = $2_1 + 16 | 0;
 }
 
 function $250($0_1, $1_1) {
  $0_1 = $0_1 | 0;
  $1_1 = +$1_1;
  var $2_1 = 0, $3_1 = Math_fround(0), $4_1 = 0;
  $2_1 = global$0 - 16 | 0;
  global$0 = $2_1;
  $4_1 = HEAP32[$0_1 >> 2];
  $3_1 = Math_fround($1_1);
  block : {
   if ($3_1 != $3_1) {
    $3_1 = Math_fround(NaN);
    $0_1 = 0;
    break block;
   }
   $0_1 = $3_1 == Math_fround(Infinity) | $3_1 == Math_fround(-Infinity);
   $3_1 = $0_1 ? Math_fround(NaN) : $3_1;
   $0_1 = !$0_1;
  }
  HEAP8[$2_1 + 12 | 0] = $0_1;
  HEAPF32[$2_1 + 8 >> 2] = $3_1;
  $0_1 = HEAP32[$2_1 + 12 >> 2];
  HEAP32[$2_1 >> 2] = HEAP32[$2_1 + 8 >> 2];
  HEAP32[$2_1 + 4 >> 2] = $0_1;
  $40($4_1, 1, $2_1);
  global$0 = $2_1 + 16 | 0;
 }
 
 function $251($0_1) {
  $0_1 = $0_1 | 0;
  var $1_1 = 0, $2_1 = 0;
  $1_1 = global$0 - 16 | 0;
  global$0 = $1_1;
  $0_1 = HEAP32[$0_1 >> 2];
  HEAP8[$1_1 + 12 | 0] = 3;
  HEAP32[$1_1 + 8 >> 2] = 2143289344;
  $2_1 = HEAP32[$1_1 + 12 >> 2];
  HEAP32[$1_1 >> 2] = HEAP32[$1_1 + 8 >> 2];
  HEAP32[$1_1 + 4 >> 2] = $2_1;
  $40($0_1, 0, $1_1);
  global$0 = $1_1 + 16 | 0;
 }
 
 function $252($0_1, $1_1) {
  $0_1 = $0_1 | 0;
  $1_1 = +$1_1;
  var $2_1 = 0, $3_1 = Math_fround(0), $4_1 = 0, $5_1 = 0;
  $2_1 = global$0 - 16 | 0;
  global$0 = $2_1;
  $5_1 = HEAP32[$0_1 >> 2];
  $3_1 = Math_fround($1_1);
  block : {
   if ($3_1 != $3_1) {
    $0_1 = 0;
    $3_1 = Math_fround(NaN);
    break block;
   }
   $4_1 = $3_1 == Math_fround(Infinity) | $3_1 == Math_fround(-Infinity);
   $0_1 = $4_1 ? 0 : 2;
   $3_1 = $4_1 ? Math_fround(NaN) : $3_1;
  }
  HEAP8[$2_1 + 12 | 0] = $0_1;
  HEAPF32[$2_1 + 8 >> 2] = $3_1;
  $0_1 = HEAP32[$2_1 + 12 >> 2];
  HEAP32[$2_1 >> 2] = HEAP32[$2_1 + 8 >> 2];
  HEAP32[$2_1 + 4 >> 2] = $0_1;
  $40($5_1, 0, $2_1);
  global$0 = $2_1 + 16 | 0;
 }
 
 function $253($0_1, $1_1) {
  $0_1 = $0_1 | 0;
  $1_1 = +$1_1;
  var $2_1 = 0, $3_1 = Math_fround(0), $4_1 = 0;
  $2_1 = global$0 - 16 | 0;
  global$0 = $2_1;
  $4_1 = HEAP32[$0_1 >> 2];
  $3_1 = Math_fround($1_1);
  block : {
   if ($3_1 != $3_1) {
    $3_1 = Math_fround(NaN);
    $0_1 = 0;
    break block;
   }
   $0_1 = $3_1 == Math_fround(Infinity) | $3_1 == Math_fround(-Infinity);
   $3_1 = $0_1 ? Math_fround(NaN) : $3_1;
   $0_1 = !$0_1;
  }
  HEAP8[$2_1 + 12 | 0] = $0_1;
  HEAPF32[$2_1 + 8 >> 2] = $3_1;
  $0_1 = HEAP32[$2_1 + 12 >> 2];
  HEAP32[$2_1 >> 2] = HEAP32[$2_1 + 8 >> 2];
  HEAP32[$2_1 + 4 >> 2] = $0_1;
  $40($4_1, 0, $2_1);
  global$0 = $2_1 + 16 | 0;
 }
 
 function $254($0_1, $1_1) {
  $0_1 = $0_1 | 0;
  $1_1 = +$1_1;
  var $2_1 = 0, $3_1 = Math_fround(0), $4_1 = Math_fround(0), $5_1 = 0, $6_1 = 0;
  block : {
   $3_1 = Math_fround($1_1);
   $0_1 = HEAP32[$0_1 >> 2];
   $5_1 = $0_1 + 124 | 0;
   $2_1 = $0_1 + 28 | 0;
   $4_1 = $2($5_1, HEAPU16[$2_1 >> 1]);
   if ($3_1 == $4_1) {
    break block
   }
   $6_1 = $3_1 == $3_1;
   if (!$6_1 & $4_1 != $4_1) {
    break block
   }
   block1 : {
    if (!$6_1) {
     HEAP16[$2_1 >> 1] = HEAPU16[$2_1 >> 1] & 65528;
     break block1;
    }
    $46($5_1, $2_1, $3_1, 3);
   }
   while (1) {
    $2_1 = HEAPU8[$0_1 | 0];
    if ($2_1 & 4) {
     break block
    }
    HEAP8[$0_1 | 0] = $2_1 | 4;
    $2_1 = HEAP32[$0_1 + 16 >> 2];
    if ($2_1) {
     FUNCTION_TABLE[$2_1 | 0]($0_1)
    }
    HEAP32[$0_1 + 156 >> 2] = 2143289344;
    $0_1 = HEAP32[$0_1 + 484 >> 2];
    if ($0_1) {
     continue
    }
    break;
   };
  }
 }
 
 function $255($0_1, $1_1) {
  $0_1 = $0_1 | 0;
  $1_1 = +$1_1;
  var $2_1 = 0, $3_1 = Math_fround(0), $4_1 = Math_fround(0), $5_1 = 0, $6_1 = 0;
  block : {
   $3_1 = Math_fround($1_1);
   $0_1 = HEAP32[$0_1 >> 2];
   $5_1 = $0_1 + 124 | 0;
   $2_1 = $0_1 + 26 | 0;
   $4_1 = $2($5_1, HEAPU16[$2_1 >> 1]);
   if ($3_1 == $4_1) {
    break block
   }
   $6_1 = $3_1 == $3_1;
   if (!$6_1 & $4_1 != $4_1) {
    break block
   }
   block1 : {
    if (!$6_1) {
     HEAP16[$2_1 >> 1] = HEAPU16[$2_1 >> 1] & 65528;
     break block1;
    }
    $46($5_1, $2_1, $3_1, 3);
   }
   while (1) {
    $2_1 = HEAPU8[$0_1 | 0];
    if ($2_1 & 4) {
     break block
    }
    HEAP8[$0_1 | 0] = $2_1 | 4;
    $2_1 = HEAP32[$0_1 + 16 >> 2];
    if ($2_1) {
     FUNCTION_TABLE[$2_1 | 0]($0_1)
    }
    HEAP32[$0_1 + 156 >> 2] = 2143289344;
    $0_1 = HEAP32[$0_1 + 484 >> 2];
    if ($0_1) {
     continue
    }
    break;
   };
  }
 }
 
 function $256($0_1) {
  $0_1 = $0_1 | 0;
  var $1_1 = 0, $2_1 = 0;
  $1_1 = global$0 - 16 | 0;
  global$0 = $1_1;
  $0_1 = HEAP32[$0_1 >> 2];
  HEAP8[$1_1 + 12 | 0] = 3;
  HEAP32[$1_1 + 8 >> 2] = 2143289344;
  $2_1 = HEAP32[$1_1 + 12 >> 2];
  HEAP32[$1_1 >> 2] = HEAP32[$1_1 + 8 >> 2];
  HEAP32[$1_1 + 4 >> 2] = $2_1;
  $77($0_1, $1_1);
  global$0 = $1_1 + 16 | 0;
 }
 
 function $257($0_1, $1_1) {
  $0_1 = $0_1 | 0;
  $1_1 = +$1_1;
  var $2_1 = 0, $3_1 = Math_fround(0), $4_1 = 0, $5_1 = 0;
  $2_1 = global$0 - 16 | 0;
  global$0 = $2_1;
  $5_1 = HEAP32[$0_1 >> 2];
  $3_1 = Math_fround($1_1);
  block : {
   if ($3_1 != $3_1) {
    $0_1 = 0;
    $3_1 = Math_fround(NaN);
    break block;
   }
   $4_1 = $3_1 == Math_fround(Infinity) | $3_1 == Math_fround(-Infinity);
   $0_1 = $4_1 ? 0 : 2;
   $3_1 = $4_1 ? Math_fround(NaN) : $3_1;
  }
  HEAP8[$2_1 + 12 | 0] = $0_1;
  HEAPF32[$2_1 + 8 >> 2] = $3_1;
  $0_1 = HEAP32[$2_1 + 12 >> 2];
  HEAP32[$2_1 >> 2] = HEAP32[$2_1 + 8 >> 2];
  HEAP32[$2_1 + 4 >> 2] = $0_1;
  $77($5_1, $2_1);
  global$0 = $2_1 + 16 | 0;
 }
 
 function $258($0_1, $1_1) {
  $0_1 = $0_1 | 0;
  $1_1 = +$1_1;
  var $2_1 = 0, $3_1 = Math_fround(0), $4_1 = 0;
  $2_1 = global$0 - 16 | 0;
  global$0 = $2_1;
  $4_1 = HEAP32[$0_1 >> 2];
  $3_1 = Math_fround($1_1);
  block : {
   if ($3_1 != $3_1) {
    $3_1 = Math_fround(NaN);
    $0_1 = 0;
    break block;
   }
   $0_1 = $3_1 == Math_fround(Infinity) | $3_1 == Math_fround(-Infinity);
   $3_1 = $0_1 ? Math_fround(NaN) : $3_1;
   $0_1 = !$0_1;
  }
  HEAP8[$2_1 + 12 | 0] = $0_1;
  HEAPF32[$2_1 + 8 >> 2] = $3_1;
  $0_1 = HEAP32[$2_1 + 12 >> 2];
  HEAP32[$2_1 >> 2] = HEAP32[$2_1 + 8 >> 2];
  HEAP32[$2_1 + 4 >> 2] = $0_1;
  $77($4_1, $2_1);
  global$0 = $2_1 + 16 | 0;
 }
 
 function $259($0_1, $1_1) {
  $0_1 = $0_1 | 0;
  $1_1 = +$1_1;
  var $2_1 = 0, $3_1 = Math_fround(0), $4_1 = Math_fround(0), $5_1 = 0, $6_1 = 0;
  block : {
   $3_1 = Math_fround($1_1);
   $0_1 = HEAP32[$0_1 >> 2];
   $5_1 = $0_1 + 124 | 0;
   $2_1 = $0_1 + 24 | 0;
   $4_1 = $2($5_1, HEAPU16[$2_1 >> 1]);
   if ($3_1 == $4_1) {
    break block
   }
   $6_1 = $3_1 == $3_1;
   if (!$6_1 & $4_1 != $4_1) {
    break block
   }
   block1 : {
    if (!$6_1) {
     HEAP16[$2_1 >> 1] = HEAPU16[$2_1 >> 1] & 65528;
     break block1;
    }
    $46($5_1, $2_1, $3_1, 3);
   }
   while (1) {
    $2_1 = HEAPU8[$0_1 | 0];
    if ($2_1 & 4) {
     break block
    }
    HEAP8[$0_1 | 0] = $2_1 | 4;
    $2_1 = HEAP32[$0_1 + 16 >> 2];
    if ($2_1) {
     FUNCTION_TABLE[$2_1 | 0]($0_1)
    }
    HEAP32[$0_1 + 156 >> 2] = 2143289344;
    $0_1 = HEAP32[$0_1 + 484 >> 2];
    if ($0_1) {
     continue
    }
    break;
   };
  }
 }
 
 function $260($0_1, $1_1) {
  $0_1 = $0_1 | 0;
  $1_1 = $1_1 | 0;
  var $2_1 = 0;
  block : {
   $0_1 = HEAP32[$0_1 >> 2];
   $2_1 = HEAPU8[$0_1 + 23 | 0];
   if (($2_1 >>> 2 & 3) == ($1_1 & 255)) {
    break block
   }
   $2_1 = HEAPU8[$0_1 + 21 | 0] | HEAPU8[$0_1 + 22 | 0] << 8 | $2_1 << 16;
   HEAP8[$0_1 + 21 | 0] = $2_1;
   HEAP8[$0_1 + 22 | 0] = $2_1 >>> 8;
   HEAP8[$0_1 + 23 | 0] = ($2_1 & 15990783 | ($1_1 & 3) << 18) >>> 16;
   while (1) {
    $1_1 = HEAPU8[$0_1 | 0];
    if ($1_1 & 4) {
     break block
    }
    HEAP8[$0_1 | 0] = $1_1 | 4;
    $1_1 = HEAP32[$0_1 + 16 >> 2];
    if ($1_1) {
     FUNCTION_TABLE[$1_1 | 0]($0_1)
    }
    HEAP32[$0_1 + 156 >> 2] = 2143289344;
    $0_1 = HEAP32[$0_1 + 484 >> 2];
    if ($0_1) {
     continue
    }
    break;
   };
  }
 }
 
 function $261($0_1, $1_1) {
  $0_1 = $0_1 | 0;
  $1_1 = $1_1 | 0;
  var $2_1 = 0;
  block : {
   $0_1 = HEAP32[$0_1 >> 2];
   $2_1 = HEAPU8[$0_1 + 23 | 0];
   if (($2_1 & 3) == ($1_1 & 255)) {
    break block
   }
   $2_1 = HEAPU8[$0_1 + 21 | 0] | HEAPU8[$0_1 + 22 | 0] << 8 | $2_1 << 16;
   HEAP8[$0_1 + 21 | 0] = $2_1;
   HEAP8[$0_1 + 22 | 0] = $2_1 >>> 8;
   HEAP8[$0_1 + 23 | 0] = ($2_1 & 16580607 | ($1_1 & 3) << 16) >>> 16;
   while (1) {
    $1_1 = HEAPU8[$0_1 | 0];
    if ($1_1 & 4) {
     break block
    }
    HEAP8[$0_1 | 0] = $1_1 | 4;
    $1_1 = HEAP32[$0_1 + 16 >> 2];
    if ($1_1) {
     FUNCTION_TABLE[$1_1 | 0]($0_1)
    }
    HEAP32[$0_1 + 156 >> 2] = 2143289344;
    $0_1 = HEAP32[$0_1 + 484 >> 2];
    if ($0_1) {
     continue
    }
    break;
   };
  }
 }
 
 function $262($0_1, $1_1) {
  $0_1 = $0_1 | 0;
  $1_1 = $1_1 | 0;
  var $2_1 = 0, $3_1 = 0;
  $2_1 = global$0 - 16 | 0;
  global$0 = $2_1;
  $0_1 = HEAP32[$0_1 >> 2];
  HEAP8[$2_1 + 12 | 0] = 3;
  HEAP32[$2_1 + 8 >> 2] = 2143289344;
  $3_1 = HEAP32[$2_1 + 12 >> 2];
  HEAP32[$2_1 >> 2] = HEAP32[$2_1 + 8 >> 2];
  HEAP32[$2_1 + 4 >> 2] = $3_1;
  $71($0_1, $1_1 & 255, $2_1);
  global$0 = $2_1 + 16 | 0;
 }
 
 function $263($0_1, $1_1, $2_1) {
  $0_1 = $0_1 | 0;
  $1_1 = $1_1 | 0;
  $2_1 = +$2_1;
  var $3_1 = 0, $4_1 = Math_fround(0), $5_1 = 0, $6_1 = 0;
  $3_1 = global$0 - 16 | 0;
  global$0 = $3_1;
  $6_1 = HEAP32[$0_1 >> 2];
  $4_1 = Math_fround($2_1);
  block : {
   if ($4_1 != $4_1) {
    $0_1 = 0;
    $4_1 = Math_fround(NaN);
    break block;
   }
   $5_1 = $4_1 == Math_fround(Infinity) | $4_1 == Math_fround(-Infinity);
   $0_1 = $5_1 ? 0 : 2;
   $4_1 = $5_1 ? Math_fround(NaN) : $4_1;
  }
  HEAP8[$3_1 + 12 | 0] = $0_1;
  HEAPF32[$3_1 + 8 >> 2] = $4_1;
  $0_1 = HEAP32[$3_1 + 12 >> 2];
  HEAP32[$3_1 >> 2] = HEAP32[$3_1 + 8 >> 2];
  HEAP32[$3_1 + 4 >> 2] = $0_1;
  $71($6_1, $1_1 & 255, $3_1);
  global$0 = $3_1 + 16 | 0;
 }
 
 function $264($0_1, $1_1, $2_1) {
  $0_1 = $0_1 | 0;
  $1_1 = $1_1 | 0;
  $2_1 = +$2_1;
  var $3_1 = 0, $4_1 = Math_fround(0), $5_1 = 0;
  $3_1 = global$0 - 16 | 0;
  global$0 = $3_1;
  $5_1 = HEAP32[$0_1 >> 2];
  $4_1 = Math_fround($2_1);
  block : {
   if ($4_1 != $4_1) {
    $4_1 = Math_fround(NaN);
    $0_1 = 0;
    break block;
   }
   $0_1 = $4_1 == Math_fround(Infinity) | $4_1 == Math_fround(-Infinity);
   $4_1 = $0_1 ? Math_fround(NaN) : $4_1;
   $0_1 = !$0_1;
  }
  HEAP8[$3_1 + 12 | 0] = $0_1;
  HEAPF32[$3_1 + 8 >> 2] = $4_1;
  $0_1 = HEAP32[$3_1 + 12 >> 2];
  HEAP32[$3_1 >> 2] = HEAP32[$3_1 + 8 >> 2];
  HEAP32[$3_1 + 4 >> 2] = $0_1;
  $71($5_1, $1_1 & 255, $3_1);
  global$0 = $3_1 + 16 | 0;
 }
 
 function $265($0_1, $1_1) {
  $0_1 = $0_1 | 0;
  $1_1 = $1_1 | 0;
  var $2_1 = 0;
  block : {
   $0_1 = HEAP32[$0_1 >> 2];
   $2_1 = HEAPU8[$0_1 + 20 | 0];
   if (($2_1 >>> 4 & 7) == ($1_1 & 255)) {
    break block
   }
   HEAP8[$0_1 + 20 | 0] = $2_1 & 143 | $1_1 << 4 & 112;
   while (1) {
    $1_1 = HEAPU8[$0_1 | 0];
    if ($1_1 & 4) {
     break block
    }
    HEAP8[$0_1 | 0] = $1_1 | 4;
    $1_1 = HEAP32[$0_1 + 16 >> 2];
    if ($1_1) {
     FUNCTION_TABLE[$1_1 | 0]($0_1)
    }
    HEAP32[$0_1 + 156 >> 2] = 2143289344;
    $0_1 = HEAP32[$0_1 + 484 >> 2];
    if ($0_1) {
     continue
    }
    break;
   };
  }
 }
 
 function $266($0_1, $1_1) {
  $0_1 = $0_1 | 0;
  $1_1 = $1_1 | 0;
  var $2_1 = 0;
  block : {
   $0_1 = HEAP32[$0_1 >> 2];
   $2_1 = HEAPU8[$0_1 + 21 | 0] | HEAPU8[$0_1 + 22 | 0] << 8;
   if (($1_1 & 255) == ($2_1 >>> 14 | 0)) {
    break block
   }
   $2_1 = $2_1 | HEAPU8[$0_1 + 23 | 0] << 16;
   HEAP8[$0_1 + 23 | 0] = $2_1 >>> 16;
   $1_1 = $2_1 & 16383 | $1_1 << 14;
   HEAP8[$0_1 + 21 | 0] = $1_1;
   HEAP8[$0_1 + 22 | 0] = $1_1 >>> 8;
   while (1) {
    $1_1 = HEAPU8[$0_1 | 0];
    if ($1_1 & 4) {
     break block
    }
    HEAP8[$0_1 | 0] = $1_1 | 4;
    $1_1 = HEAP32[$0_1 + 16 >> 2];
    if ($1_1) {
     FUNCTION_TABLE[$1_1 | 0]($0_1)
    }
    HEAP32[$0_1 + 156 >> 2] = 2143289344;
    $0_1 = HEAP32[$0_1 + 484 >> 2];
    if ($0_1) {
     continue
    }
    break;
   };
  }
 }
 
 function $267($0_1, $1_1) {
  $0_1 = $0_1 | 0;
  $1_1 = $1_1 | 0;
  var $2_1 = 0;
  block : {
   $0_1 = HEAP32[$0_1 >> 2];
   $2_1 = HEAPU8[$0_1 + 20 | 0];
   if (($2_1 & 3) == ($1_1 & 255)) {
    break block
   }
   HEAP8[$0_1 + 20 | 0] = $2_1 & 252 | $1_1 & 3;
   while (1) {
    $1_1 = HEAPU8[$0_1 | 0];
    if ($1_1 & 4) {
     break block
    }
    HEAP8[$0_1 | 0] = $1_1 | 4;
    $1_1 = HEAP32[$0_1 + 16 >> 2];
    if ($1_1) {
     FUNCTION_TABLE[$1_1 | 0]($0_1)
    }
    HEAP32[$0_1 + 156 >> 2] = 2143289344;
    $0_1 = HEAP32[$0_1 + 484 >> 2];
    if ($0_1) {
     continue
    }
    break;
   };
  }
 }
 
 function $268($0_1, $1_1) {
  $0_1 = $0_1 | 0;
  $1_1 = $1_1 | 0;
  var $2_1 = 0;
  block : {
   $0_1 = HEAP32[$0_1 >> 2];
   $2_1 = HEAPU8[$0_1 + 20 | 0];
   if (($2_1 >>> 2 & 3) == ($1_1 & 255)) {
    break block
   }
   HEAP8[$0_1 + 20 | 0] = $2_1 & 243 | $1_1 << 2 & 12;
   while (1) {
    $1_1 = HEAPU8[$0_1 | 0];
    if ($1_1 & 4) {
     break block
    }
    HEAP8[$0_1 | 0] = $1_1 | 4;
    $1_1 = HEAP32[$0_1 + 16 >> 2];
    if ($1_1) {
     FUNCTION_TABLE[$1_1 | 0]($0_1)
    }
    HEAP32[$0_1 + 156 >> 2] = 2143289344;
    $0_1 = HEAP32[$0_1 + 484 >> 2];
    if ($0_1) {
     continue
    }
    break;
   };
  }
 }
 
 function $269($0_1, $1_1) {
  $0_1 = $0_1 | 0;
  $1_1 = $1_1 | 0;
  var $2_1 = 0;
  block : {
   $0_1 = HEAP32[$0_1 >> 2];
   $2_1 = HEAPU8[$0_1 + 21 | 0] | HEAPU8[$0_1 + 22 | 0] << 8;
   if (($2_1 >>> 8 & 15) == ($1_1 & 255)) {
    break block
   }
   $2_1 = $2_1 | HEAPU8[$0_1 + 23 | 0] << 16;
   HEAP8[$0_1 + 23 | 0] = $2_1 >>> 16;
   $1_1 = $2_1 & 61695 | ($1_1 & 15) << 8;
   HEAP8[$0_1 + 21 | 0] = $1_1;
   HEAP8[$0_1 + 22 | 0] = $1_1 >>> 8;
   while (1) {
    $1_1 = HEAPU8[$0_1 | 0];
    if ($1_1 & 4) {
     break block
    }
    HEAP8[$0_1 | 0] = $1_1 | 4;
    $1_1 = HEAP32[$0_1 + 16 >> 2];
    if ($1_1) {
     FUNCTION_TABLE[$1_1 | 0]($0_1)
    }
    HEAP32[$0_1 + 156 >> 2] = 2143289344;
    $0_1 = HEAP32[$0_1 + 484 >> 2];
    if ($0_1) {
     continue
    }
    break;
   };
  }
 }
 
 function $270($0_1, $1_1) {
  $0_1 = $0_1 | 0;
  $1_1 = $1_1 | 0;
  var $2_1 = 0;
  block : {
   $0_1 = HEAP32[$0_1 >> 2];
   $2_1 = HEAPU8[$0_1 + 21 | 0] | HEAPU8[$0_1 + 22 | 0] << 8 | HEAPU8[$0_1 + 23 | 0] << 16;
   if (($1_1 & 255) == (($2_1 & 240) >>> 4 | 0)) {
    break block
   }
   HEAP8[$0_1 + 23 | 0] = $2_1 >>> 16;
   $1_1 = $2_1 & 65295 | $1_1 << 4 & 240;
   HEAP8[$0_1 + 21 | 0] = $1_1;
   HEAP8[$0_1 + 22 | 0] = $1_1 >>> 8;
   while (1) {
    $1_1 = HEAPU8[$0_1 | 0];
    if ($1_1 & 4) {
     break block
    }
    HEAP8[$0_1 | 0] = $1_1 | 4;
    $1_1 = HEAP32[$0_1 + 16 >> 2];
    if ($1_1) {
     FUNCTION_TABLE[$1_1 | 0]($0_1)
    }
    HEAP32[$0_1 + 156 >> 2] = 2143289344;
    $0_1 = HEAP32[$0_1 + 484 >> 2];
    if ($0_1) {
     continue
    }
    break;
   };
  }
 }
 
 function $271($0_1, $1_1) {
  $0_1 = $0_1 | 0;
  $1_1 = $1_1 | 0;
  var $2_1 = 0;
  block : {
   $0_1 = HEAP32[$0_1 >> 2];
   $2_1 = HEAPU8[$0_1 + 21 | 0] | HEAPU8[$0_1 + 22 | 0] << 8 | HEAPU8[$0_1 + 23 | 0] << 16;
   if (($2_1 & 15) == ($1_1 & 255)) {
    break block
   }
   HEAP8[$0_1 + 23 | 0] = $2_1 >>> 16;
   $1_1 = $2_1 & 65520 | $1_1 & 15;
   HEAP8[$0_1 + 21 | 0] = $1_1;
   HEAP8[$0_1 + 22 | 0] = $1_1 >>> 8;
   while (1) {
    $1_1 = HEAPU8[$0_1 | 0];
    if ($1_1 & 4) {
     break block
    }
    HEAP8[$0_1 | 0] = $1_1 | 4;
    $1_1 = HEAP32[$0_1 + 16 >> 2];
    if ($1_1) {
     FUNCTION_TABLE[$1_1 | 0]($0_1)
    }
    HEAP32[$0_1 + 156 >> 2] = 2143289344;
    $0_1 = HEAP32[$0_1 + 484 >> 2];
    if ($0_1) {
     continue
    }
    break;
   };
  }
 }
 
 function $272($0_1, $1_1) {
  $0_1 = $0_1 | 0;
  $1_1 = $1_1 | 0;
  var $2_1 = 0, $3_1 = 0;
  $2_1 = global$0 - 16 | 0;
  global$0 = $2_1;
  $0_1 = HEAP32[$0_1 >> 2];
  HEAP8[$2_1 + 12 | 0] = 3;
  HEAP32[$2_1 + 8 >> 2] = 2143289344;
  $3_1 = HEAP32[$2_1 + 12 >> 2];
  HEAP32[$2_1 >> 2] = HEAP32[$2_1 + 8 >> 2];
  HEAP32[$2_1 + 4 >> 2] = $3_1;
  $73($0_1, $1_1 & 255, $2_1);
  global$0 = $2_1 + 16 | 0;
 }
 
 function $273($0_1, $1_1, $2_1) {
  $0_1 = $0_1 | 0;
  $1_1 = $1_1 | 0;
  $2_1 = +$2_1;
  var $3_1 = 0, $4_1 = Math_fround(0), $5_1 = 0, $6_1 = 0;
  $3_1 = global$0 - 16 | 0;
  global$0 = $3_1;
  $6_1 = HEAP32[$0_1 >> 2];
  $4_1 = Math_fround($2_1);
  block : {
   if ($4_1 != $4_1) {
    $0_1 = 0;
    $4_1 = Math_fround(NaN);
    break block;
   }
   $5_1 = $4_1 == Math_fround(Infinity) | $4_1 == Math_fround(-Infinity);
   $0_1 = $5_1 ? 0 : 2;
   $4_1 = $5_1 ? Math_fround(NaN) : $4_1;
  }
  HEAP8[$3_1 + 12 | 0] = $0_1;
  HEAPF32[$3_1 + 8 >> 2] = $4_1;
  $0_1 = HEAP32[$3_1 + 12 >> 2];
  HEAP32[$3_1 >> 2] = HEAP32[$3_1 + 8 >> 2];
  HEAP32[$3_1 + 4 >> 2] = $0_1;
  $73($6_1, $1_1 & 255, $3_1);
  global$0 = $3_1 + 16 | 0;
 }
 
 function $274($0_1, $1_1, $2_1) {
  $0_1 = $0_1 | 0;
  $1_1 = $1_1 | 0;
  $2_1 = +$2_1;
  var $3_1 = 0, $4_1 = Math_fround(0), $5_1 = 0;
  $3_1 = global$0 - 16 | 0;
  global$0 = $3_1;
  $5_1 = HEAP32[$0_1 >> 2];
  $4_1 = Math_fround($2_1);
  block : {
   if ($4_1 != $4_1) {
    $4_1 = Math_fround(NaN);
    $0_1 = 0;
    break block;
   }
   $0_1 = $4_1 == Math_fround(Infinity) | $4_1 == Math_fround(-Infinity);
   $4_1 = $0_1 ? Math_fround(NaN) : $4_1;
   $0_1 = !$0_1;
  }
  HEAP8[$3_1 + 12 | 0] = $0_1;
  HEAPF32[$3_1 + 8 >> 2] = $4_1;
  $0_1 = HEAP32[$3_1 + 12 >> 2];
  HEAP32[$3_1 >> 2] = HEAP32[$3_1 + 8 >> 2];
  HEAP32[$3_1 + 4 >> 2] = $0_1;
  $73($5_1, $1_1 & 255, $3_1);
  global$0 = $3_1 + 16 | 0;
 }
 
 function $275($0_1, $1_1) {
  $0_1 = $0_1 | 0;
  $1_1 = $1_1 | 0;
  var $2_1 = 0;
  block : {
   $0_1 = HEAP32[$0_1 >> 2];
   $2_1 = HEAPU8[$0_1 + 21 | 0] | HEAPU8[$0_1 + 22 | 0] << 8;
   if (($2_1 >>> 12 & 3) == ($1_1 & 255)) {
    break block
   }
   $2_1 = $2_1 | HEAPU8[$0_1 + 23 | 0] << 16;
   HEAP8[$0_1 + 23 | 0] = $2_1 >>> 16;
   $1_1 = $2_1 & 53247 | ($1_1 & 3) << 12;
   HEAP8[$0_1 + 21 | 0] = $1_1;
   HEAP8[$0_1 + 22 | 0] = $1_1 >>> 8;
   while (1) {
    $1_1 = HEAPU8[$0_1 | 0];
    if ($1_1 & 4) {
     break block
    }
    HEAP8[$0_1 | 0] = $1_1 | 4;
    $1_1 = HEAP32[$0_1 + 16 >> 2];
    if ($1_1) {
     FUNCTION_TABLE[$1_1 | 0]($0_1)
    }
    HEAP32[$0_1 + 156 >> 2] = 2143289344;
    $0_1 = HEAP32[$0_1 + 484 >> 2];
    if ($0_1) {
     continue
    }
    break;
   };
  }
 }
 
 function $276($0_1, $1_1) {
  $0_1 = $0_1 | 0;
  $1_1 = $1_1 | 0;
  var $2_1 = 0;
  block : {
   $0_1 = HEAP32[$0_1 >> 2];
   $2_1 = HEAPU8[$0_1 + 23 | 0];
   if (($2_1 >>> 4 & 1) == ($1_1 & 255)) {
    break block
   }
   $2_1 = HEAPU8[$0_1 + 21 | 0] | HEAPU8[$0_1 + 22 | 0] << 8 | $2_1 << 16;
   HEAP8[$0_1 + 21 | 0] = $2_1;
   HEAP8[$0_1 + 22 | 0] = $2_1 >>> 8;
   HEAP8[$0_1 + 23 | 0] = ($2_1 & 15728639 | ($1_1 & 1) << 20) >>> 16;
   while (1) {
    $1_1 = HEAPU8[$0_1 | 0];
    if ($1_1 & 4) {
     break block
    }
    HEAP8[$0_1 | 0] = $1_1 | 4;
    $1_1 = HEAP32[$0_1 + 16 >> 2];
    if ($1_1) {
     FUNCTION_TABLE[$1_1 | 0]($0_1)
    }
    HEAP32[$0_1 + 156 >> 2] = 2143289344;
    $0_1 = HEAP32[$0_1 + 484 >> 2];
    if ($0_1) {
     continue
    }
    break;
   };
  }
 }
 
 function $277($0_1, $1_1) {
  $0_1 = $0_1 | 0;
  $1_1 = $1_1 | 0;
  var $2_1 = 0, $3_1 = 0, $4_1 = Math_fround(0), $5_1 = Math_fround(0), $6_1 = 0, $7_1 = 0, $8_1 = 0, $9 = 0, $10_1 = 0, $11_1 = 0;
  $2_1 = global$0 - 16 | 0;
  global$0 = $2_1;
  $8_1 = HEAP32[$1_1 >> 2];
  $1_1 = HEAP32[$0_1 >> 2];
  block13 : {
   block : {
    if ((HEAPU8[$8_1 + 20 | 0] ^ HEAPU8[$1_1 + 20 | 0]) & 127 | ((HEAPU8[$8_1 + 21 | 0] | HEAPU8[$8_1 + 22 | 0] << 8 | HEAPU8[$8_1 + 23 | 0] << 16) ^ (HEAPU8[$1_1 + 21 | 0] | HEAPU8[$1_1 + 22 | 0] << 8 | HEAPU8[$1_1 + 23 | 0] << 16)) & 1048575) {
     break block
    }
    $9 = $8_1 + 124 | 0;
    $10_1 = $1_1 + 124 | 0;
    $0_1 = HEAPU8[$1_1 + 24 | 0] | HEAPU8[$1_1 + 25 | 0] << 8;
    block1 : {
     if (!($0_1 & 7 | HEAPU8[$8_1 + 24 | 0] & 7)) {
      break block1
     }
     $4_1 = $2($10_1, $0_1);
     $5_1 = $2($9, HEAPU8[$8_1 + 24 | 0] | HEAPU8[$8_1 + 25 | 0] << 8);
     if ($4_1 == $5_1) {
      break block1
     }
     if ($4_1 == $4_1 | $5_1 == $5_1) {
      break block
     }
    }
    $0_1 = HEAPU8[$1_1 + 26 | 0] | HEAPU8[$1_1 + 27 | 0] << 8;
    block2 : {
     if (!($0_1 & 7 | HEAPU8[$8_1 + 26 | 0] & 7)) {
      break block2
     }
     $4_1 = $2($10_1, $0_1);
     $5_1 = $2($9, HEAPU8[$8_1 + 26 | 0] | HEAPU8[$8_1 + 27 | 0] << 8);
     if ($4_1 == $5_1) {
      break block2
     }
     if ($4_1 == $4_1 | $5_1 == $5_1) {
      break block
     }
    }
    $0_1 = HEAPU8[$1_1 + 28 | 0] | HEAPU8[$1_1 + 29 | 0] << 8;
    block3 : {
     if (!($0_1 & 7 | HEAPU8[$8_1 + 28 | 0] & 7)) {
      break block3
     }
     $4_1 = $2($10_1, $0_1);
     $5_1 = $2($9, HEAPU8[$8_1 + 28 | 0] | HEAPU8[$8_1 + 29 | 0] << 8);
     if ($4_1 == $5_1) {
      break block3
     }
     if ($4_1 == $4_1 | $5_1 == $5_1) {
      break block
     }
    }
    $0_1 = HEAPU8[$1_1 + 30 | 0] | HEAPU8[$1_1 + 31 | 0] << 8;
    if ($0_1 & 7 | HEAPU8[$8_1 + 30 | 0] & 7) {
     $1($2_1 + 8 | 0, $10_1, $0_1);
     $1($2_1, $9, HEAPU8[$8_1 + 30 | 0] | HEAPU8[$8_1 + 31 | 0] << 8);
     $4_1 = HEAPF32[$2_1 + 8 >> 2];
     $5_1 = HEAPF32[$2_1 >> 2];
     if ($4_1 != $5_1) {
      if ($4_1 == $4_1) {
       break block
      }
      $0_1 = $5_1 != $5_1;
     } else {
      $0_1 = 1
     }
     if (!$0_1 | HEAPU8[$2_1 + 12 | 0] != HEAPU8[$2_1 + 4 | 0]) {
      break block
     }
    }
    $0_1 = $8_1 + 32 | 0;
    $6_1 = $1_1 + 32 | 0;
    while (1) {
     $3_1 = $6_1 + ($7_1 << 1) | 0;
     $3_1 = HEAPU8[$3_1 | 0] | HEAPU8[$3_1 + 1 | 0] << 8;
     if ($3_1 & 7 | HEAPU8[$0_1 | 0] & 7) {
      $1($2_1 + 8 | 0, $10_1, $3_1);
      $1($2_1, $9, HEAPU8[$0_1 | 0] | HEAPU8[$0_1 + 1 | 0] << 8);
      $4_1 = HEAPF32[$2_1 + 8 >> 2];
      $5_1 = HEAPF32[$2_1 >> 2];
      if ($4_1 != $5_1) {
       if ($4_1 == $4_1) {
        break block
       }
       $3_1 = $5_1 != $5_1;
      } else {
       $3_1 = 1
      }
      if (!$3_1 | HEAPU8[$2_1 + 12 | 0] != HEAPU8[$2_1 + 4 | 0]) {
       break block
      }
     }
     $0_1 = $0_1 + 2 | 0;
     $7_1 = $7_1 + 1 | 0;
     if (($7_1 | 0) != 9) {
      continue
     }
     break;
    };
    $0_1 = $8_1 + 50 | 0;
    $6_1 = $1_1 + 50 | 0;
    $7_1 = 0;
    while (1) {
     $3_1 = $6_1 + ($7_1 << 1) | 0;
     $3_1 = HEAPU8[$3_1 | 0] | HEAPU8[$3_1 + 1 | 0] << 8;
     if ($3_1 & 7 | HEAPU8[$0_1 | 0] & 7) {
      $1($2_1 + 8 | 0, $10_1, $3_1);
      $1($2_1, $9, HEAPU8[$0_1 | 0] | HEAPU8[$0_1 + 1 | 0] << 8);
      $4_1 = HEAPF32[$2_1 + 8 >> 2];
      $5_1 = HEAPF32[$2_1 >> 2];
      if ($4_1 != $5_1) {
       if ($4_1 == $4_1) {
        break block
       }
       $3_1 = $5_1 != $5_1;
      } else {
       $3_1 = 1
      }
      if (!$3_1 | HEAPU8[$2_1 + 12 | 0] != HEAPU8[$2_1 + 4 | 0]) {
       break block
      }
     }
     $0_1 = $0_1 + 2 | 0;
     $7_1 = $7_1 + 1 | 0;
     if (($7_1 | 0) != 9) {
      continue
     }
     break;
    };
    $0_1 = $8_1 + 68 | 0;
    $6_1 = $1_1 + 68 | 0;
    $7_1 = 0;
    while (1) {
     $3_1 = $6_1 + ($7_1 << 1) | 0;
     $3_1 = HEAPU8[$3_1 | 0] | HEAPU8[$3_1 + 1 | 0] << 8;
     if ($3_1 & 7 | HEAPU8[$0_1 | 0] & 7) {
      $1($2_1 + 8 | 0, $10_1, $3_1);
      $1($2_1, $9, HEAPU8[$0_1 | 0] | HEAPU8[$0_1 + 1 | 0] << 8);
      $4_1 = HEAPF32[$2_1 + 8 >> 2];
      $5_1 = HEAPF32[$2_1 >> 2];
      if ($4_1 != $5_1) {
       if ($4_1 == $4_1) {
        break block
       }
       $3_1 = $5_1 != $5_1;
      } else {
       $3_1 = 1
      }
      if (!$3_1 | HEAPU8[$2_1 + 12 | 0] != HEAPU8[$2_1 + 4 | 0]) {
       break block
      }
     }
     $0_1 = $0_1 + 2 | 0;
     $7_1 = $7_1 + 1 | 0;
     if (($7_1 | 0) != 9) {
      continue
     }
     break;
    };
    $0_1 = $8_1 + 86 | 0;
    $6_1 = $1_1 + 86 | 0;
    $7_1 = 0;
    while (1) {
     $3_1 = $6_1 + ($7_1 << 1) | 0;
     $3_1 = HEAPU8[$3_1 | 0] | HEAPU8[$3_1 + 1 | 0] << 8;
     if ($3_1 & 7 | HEAPU8[$0_1 | 0] & 7) {
      $1($2_1 + 8 | 0, $10_1, $3_1);
      $1($2_1, $9, HEAPU8[$0_1 | 0] | HEAPU8[$0_1 + 1 | 0] << 8);
      $4_1 = HEAPF32[$2_1 + 8 >> 2];
      $5_1 = HEAPF32[$2_1 >> 2];
      if ($4_1 != $5_1) {
       if ($4_1 == $4_1) {
        break block
       }
       $3_1 = $5_1 != $5_1;
      } else {
       $3_1 = 1
      }
      if (!$3_1 | HEAPU8[$2_1 + 12 | 0] != HEAPU8[$2_1 + 4 | 0]) {
       break block
      }
     }
     $0_1 = $0_1 + 2 | 0;
     $7_1 = $7_1 + 1 | 0;
     if (($7_1 | 0) != 9) {
      continue
     }
     break;
    };
    $0_1 = $8_1 + 104 | 0;
    $6_1 = $1_1 + 104 | 0;
    $7_1 = 0;
    while (1) {
     $3_1 = $6_1 + ($7_1 << 1) | 0;
     $3_1 = HEAPU8[$3_1 | 0] | HEAPU8[$3_1 + 1 | 0] << 8;
     if ($3_1 & 7 | HEAPU8[$0_1 | 0] & 7) {
      $1($2_1 + 8 | 0, $10_1, $3_1);
      $1($2_1, $9, HEAPU8[$0_1 | 0] | HEAPU8[$0_1 + 1 | 0] << 8);
      $4_1 = HEAPF32[$2_1 + 8 >> 2];
      $5_1 = HEAPF32[$2_1 >> 2];
      if ($4_1 != $5_1) {
       if ($4_1 == $4_1) {
        break block
       }
       $3_1 = $5_1 != $5_1;
      } else {
       $3_1 = 1
      }
      if (!$3_1 | HEAPU8[$2_1 + 12 | 0] != HEAPU8[$2_1 + 4 | 0]) {
       break block
      }
     }
     $0_1 = $0_1 + 2 | 0;
     $7_1 = $7_1 + 1 | 0;
     if (($7_1 | 0) != 3) {
      continue
     }
     break;
    };
    $0_1 = $8_1 + 110 | 0;
    $11_1 = $1_1 + 110 | 0;
    $3_1 = 0;
    $7_1 = 0;
    while (1) {
     $6_1 = $11_1 + ($7_1 << 1) | 0;
     $6_1 = HEAPU8[$6_1 | 0] | HEAPU8[$6_1 + 1 | 0] << 8;
     if ($6_1 & 7 | HEAPU8[$0_1 | 0] & 7) {
      $1($2_1 + 8 | 0, $10_1, $6_1);
      $1($2_1, $9, HEAPU8[$0_1 | 0] | HEAPU8[$0_1 + 1 | 0] << 8);
      $4_1 = HEAPF32[$2_1 + 8 >> 2];
      $5_1 = HEAPF32[$2_1 >> 2];
      if ($4_1 != $5_1) {
       if ($4_1 == $4_1) {
        break block
       }
       $6_1 = $5_1 != $5_1;
      } else {
       $6_1 = 1
      }
      if (!$6_1 | HEAPU8[$2_1 + 12 | 0] != HEAPU8[$2_1 + 4 | 0]) {
       break block
      }
     }
     $0_1 = $0_1 + 2 | 0;
     $7_1 = 1;
     $6_1 = $3_1;
     $3_1 = 1;
     if (!$6_1) {
      continue
     }
     break;
    };
    $0_1 = $8_1 + 114 | 0;
    $11_1 = $1_1 + 114 | 0;
    $3_1 = 0;
    $7_1 = 0;
    while (1) {
     $6_1 = $11_1 + ($7_1 << 1) | 0;
     $6_1 = HEAPU8[$6_1 | 0] | HEAPU8[$6_1 + 1 | 0] << 8;
     if ($6_1 & 7 | HEAPU8[$0_1 | 0] & 7) {
      $1($2_1 + 8 | 0, $10_1, $6_1);
      $1($2_1, $9, HEAPU8[$0_1 | 0] | HEAPU8[$0_1 + 1 | 0] << 8);
      $4_1 = HEAPF32[$2_1 + 8 >> 2];
      $5_1 = HEAPF32[$2_1 >> 2];
      if ($4_1 != $5_1) {
       if ($4_1 == $4_1) {
        break block
       }
       $6_1 = $5_1 != $5_1;
      } else {
       $6_1 = 1
      }
      if (!$6_1 | HEAPU8[$2_1 + 12 | 0] != HEAPU8[$2_1 + 4 | 0]) {
       break block
      }
     }
     $0_1 = $0_1 + 2 | 0;
     $7_1 = 1;
     $6_1 = $3_1;
     $3_1 = 1;
     if (!$6_1) {
      continue
     }
     break;
    };
    $0_1 = $8_1 + 118 | 0;
    $11_1 = $1_1 + 118 | 0;
    $3_1 = 0;
    $7_1 = 0;
    while (1) {
     $6_1 = $11_1 + ($7_1 << 1) | 0;
     $6_1 = HEAPU8[$6_1 | 0] | HEAPU8[$6_1 + 1 | 0] << 8;
     if ($6_1 & 7 | HEAPU8[$0_1 | 0] & 7) {
      $1($2_1 + 8 | 0, $10_1, $6_1);
      $1($2_1, $9, HEAPU8[$0_1 | 0] | HEAPU8[$0_1 + 1 | 0] << 8);
      $4_1 = HEAPF32[$2_1 + 8 >> 2];
      $5_1 = HEAPF32[$2_1 >> 2];
      if ($4_1 != $5_1) {
       if ($4_1 == $4_1) {
        break block
       }
       $6_1 = $5_1 != $5_1;
      } else {
       $6_1 = 1
      }
      if (!$6_1 | HEAPU8[$2_1 + 12 | 0] != HEAPU8[$2_1 + 4 | 0]) {
       break block
      }
     }
     $0_1 = $0_1 + 2 | 0;
     $7_1 = 1;
     $6_1 = $3_1;
     $3_1 = 1;
     if (!$6_1) {
      continue
     }
     break;
    };
    $0_1 = HEAPU8[$1_1 + 122 | 0] | HEAPU8[$1_1 + 123 | 0] << 8;
    if (!($0_1 & 7 | HEAPU8[$8_1 + 122 | 0] & 7)) {
     break block13
    }
    $4_1 = $2($10_1, $0_1);
    $5_1 = $2($9, HEAPU8[$8_1 + 122 | 0] | HEAPU8[$8_1 + 123 | 0] << 8);
    if ($4_1 == $5_1) {
     break block13
    }
    if ($4_1 == $4_1) {
     break block
    }
    if ($5_1 != $5_1) {
     break block13
    }
   }
   $13($1_1 + 20 | 0, $8_1 + 20 | 0, 104);
   $130($1_1 + 124 | 0, $8_1 + 124 | 0);
   while (1) {
    $0_1 = HEAPU8[$1_1 | 0];
    if ($0_1 & 4) {
     break block13
    }
    HEAP8[$1_1 | 0] = $0_1 | 4;
    $0_1 = HEAP32[$1_1 + 16 >> 2];
    if ($0_1) {
     FUNCTION_TABLE[$0_1 | 0]($1_1)
    }
    HEAP32[$1_1 + 156 >> 2] = 2143289344;
    $1_1 = HEAP32[$1_1 + 484 >> 2];
    if ($1_1) {
     continue
    }
    break;
   };
  }
  global$0 = $2_1 + 16 | 0;
 }
 
 function $278($0_1) {
  $0_1 = $0_1 | 0;
  var $1_1 = 0, $2_1 = 0, $3_1 = 0, $4_1 = 0;
  $3_1 = global$0 - 544 | 0;
  global$0 = $3_1;
  $1_1 = HEAP32[$0_1 + 4 >> 2];
  HEAP32[$0_1 + 4 >> 2] = 0;
  if ($1_1) {
   FUNCTION_TABLE[HEAP32[HEAP32[$1_1 >> 2] + 4 >> 2]]($1_1)
  }
  $1_1 = HEAP32[$0_1 + 8 >> 2];
  HEAP32[$0_1 + 8 >> 2] = 0;
  if ($1_1) {
   FUNCTION_TABLE[HEAP32[HEAP32[$1_1 >> 2] + 4 >> 2]]($1_1)
  }
  block : {
   $0_1 = HEAP32[$0_1 >> 2];
   if (HEAP32[$0_1 + 488 >> 2] == HEAP32[$0_1 + 492 >> 2]) {
    if (HEAP32[$0_1 + 484 >> 2]) {
     break block
    }
    $1_1 = $62($3_1 + 24 | 0, HEAP32[$0_1 + 500 >> 2]);
    $2_1 = HEAP32[$1_1 + 4 >> 2];
    HEAP32[$0_1 >> 2] = HEAP32[$1_1 >> 2];
    HEAP32[$0_1 + 4 >> 2] = $2_1;
    HEAP32[$0_1 + 16 >> 2] = HEAP32[$1_1 + 16 >> 2];
    $2_1 = HEAP32[$1_1 + 12 >> 2];
    HEAP32[$0_1 + 8 >> 2] = HEAP32[$1_1 + 8 >> 2];
    HEAP32[$0_1 + 12 >> 2] = $2_1;
    $13($0_1 + 20 | 0, $1_1 + 20 | 0, 104);
    $2_1 = HEAP32[$1_1 + 144 >> 2];
    HEAP32[$0_1 + 140 >> 2] = HEAP32[$1_1 + 140 >> 2];
    HEAP32[$0_1 + 144 >> 2] = $2_1;
    $2_1 = HEAP32[$1_1 + 136 >> 2];
    HEAP32[$0_1 + 132 >> 2] = HEAP32[$1_1 + 132 >> 2];
    HEAP32[$0_1 + 136 >> 2] = $2_1;
    $2_1 = HEAP32[$1_1 + 128 >> 2];
    HEAP32[$0_1 + 124 >> 2] = HEAP32[$1_1 + 124 >> 2];
    HEAP32[$0_1 + 128 >> 2] = $2_1;
    $4_1 = HEAP32[$1_1 + 148 >> 2];
    HEAP32[$1_1 + 148 >> 2] = 0;
    $2_1 = HEAP32[$0_1 + 148 >> 2];
    HEAP32[$0_1 + 148 >> 2] = $4_1;
    if ($2_1) {
     $61($2_1)
    }
    $13($0_1 + 152 | 0, $1_1 + 152 | 0, 336);
    $2_1 = HEAP32[$0_1 + 488 >> 2];
    if ($2_1) {
     HEAP32[$0_1 + 492 >> 2] = $2_1;
     $5($2_1);
    }
    HEAP32[$0_1 + 488 >> 2] = HEAP32[$1_1 + 488 >> 2];
    HEAP32[$0_1 + 492 >> 2] = HEAP32[$1_1 + 492 >> 2];
    HEAP32[$0_1 + 496 >> 2] = HEAP32[$1_1 + 496 >> 2];
    HEAP32[$1_1 + 496 >> 2] = 0;
    HEAP32[$1_1 + 488 >> 2] = 0;
    HEAP32[$1_1 + 492 >> 2] = 0;
    $2_1 = HEAP32[$1_1 + 512 >> 2];
    HEAP32[$0_1 + 508 >> 2] = HEAP32[$1_1 + 508 >> 2];
    HEAP32[$0_1 + 512 >> 2] = $2_1;
    $2_1 = HEAP32[$1_1 + 504 >> 2];
    HEAP32[$0_1 + 500 >> 2] = HEAP32[$1_1 + 500 >> 2];
    HEAP32[$0_1 + 504 >> 2] = $2_1;
    HEAP32[$0_1 + 516 >> 2] = HEAP32[$1_1 + 516 >> 2];
    $0_1 = HEAP32[$1_1 + 148 >> 2];
    HEAP32[$1_1 + 148 >> 2] = 0;
    if ($0_1) {
     $61($0_1)
    }
    global$0 = $3_1 + 544 | 0;
    return;
   }
   HEAP32[$3_1 + 16 >> 2] = 3696;
   $14($0_1, 5, 4824, $3_1 + 16 | 0);
   $6();
   wasm2js_trap();
  }
  HEAP32[$3_1 >> 2] = 2278;
  $14($0_1, 5, 4824, $3_1);
  $6();
  wasm2js_trap();
 }
 
 function $279($0_1) {
  $0_1 = $0_1 | 0;
  return $132($0(12), $0_1) | 0;
 }
 
 function $280() {
  return $132($0(12), 0) | 0;
 }
 
 function $281($0_1) {
  $0_1 = $0_1 | 0;
  return HEAP8[HEAP32[$0_1 >> 2] + 8 | 0] & 1;
 }
 
 function $282($0_1) {
  $0_1 = $0_1 | 0;
  return HEAP32[HEAP32[$0_1 >> 2] + 20 >> 2];
 }
 
 function $283($0_1, $1_1) {
  $0_1 = $0_1 | 0;
  $1_1 = $1_1 | 0;
  if ($1_1 & 255) {
   fimport$2();
   wasm2js_trap();
  }
  return HEAP32[HEAP32[$0_1 >> 2] + 16 >> 2] & 1;
 }
 
 function $284($0_1, $1_1) {
  $0_1 = $0_1 | 0;
  $1_1 = $1_1 | 0;
  $0_1 = HEAP32[$0_1 >> 2];
  HEAP8[$0_1 + 8 | 0] = HEAPU8[$0_1 + 8 | 0] & 254 | $1_1;
 }
 
 function $285($0_1, $1_1) {
  $0_1 = $0_1 | 0;
  $1_1 = $1_1 | 0;
  $0_1 = HEAP32[$0_1 >> 2];
  if (HEAP32[$0_1 + 20 >> 2] != ($1_1 | 0)) {
   HEAP32[$0_1 + 20 >> 2] = $1_1;
   HEAP32[$0_1 + 12 >> 2] = HEAP32[$0_1 + 12 >> 2] + 1;
  }
 }
 
 function $286($0_1, $1_1) {
  $0_1 = $0_1 | 0;
  $1_1 = Math_fround($1_1);
  var $2_1 = 0, $3_1 = 0;
  $2_1 = global$0 - 16 | 0;
  global$0 = $2_1;
  $0_1 = HEAP32[$0_1 >> 2];
  if ($1_1 >= Math_fround(0.0)) {
   if (HEAPF32[$0_1 + 24 >> 2] != $1_1) {
    HEAPF32[$0_1 + 24 >> 2] = $1_1;
    HEAP32[$0_1 + 12 >> 2] = HEAP32[$0_1 + 12 >> 2] + 1;
   }
   global$0 = $2_1 + 16 | 0;
   return;
  }
  HEAP32[$2_1 >> 2] = 2568;
  $3_1 = global$0 - 16 | 0;
  global$0 = $3_1;
  HEAP32[$3_1 + 12 >> 2] = $2_1;
  block : {
   if (!$0_1) {
    $43(6200, 4824, $2_1);
    break block;
   }
   FUNCTION_TABLE[HEAP32[$0_1 + 4 >> 2]]($0_1, 0, 5, 4824, $2_1) | 0;
  }
  global$0 = $3_1 + 16 | 0;
  $6();
  wasm2js_trap();
 }
 
 function $287($0_1, $1_1, $2_1) {
  $0_1 = $0_1 | 0;
  $1_1 = $1_1 | 0;
  $2_1 = $2_1 | 0;
  if (!($1_1 & 255)) {
   $0_1 = HEAP32[$0_1 >> 2];
   $1_1 = HEAP32[$0_1 + 16 >> 2];
   if (($1_1 & 1) != ($2_1 | 0)) {
    HEAP32[$0_1 + 16 >> 2] = $1_1 & -2 | $2_1;
    HEAP32[$0_1 + 12 >> 2] = HEAP32[$0_1 + 12 >> 2] + 1;
   }
   return;
  }
  fimport$2();
  wasm2js_trap();
 }
 
 function _ZN17compiler_builtins3int4udiv10divmod_u6417h6026910b5ed08e40E($0_1, $1_1, $2_1) {
  var $3_1 = 0, $4_1 = 0, $5_1 = 0, $6_1 = 0, $7_1 = 0, $8_1 = 0, $9 = 0, $10_1 = 0, $11_1 = 0;
  label$1 : {
   label$2 : {
    label$3 : {
     label$4 : {
      label$5 : {
       label$6 : {
        label$7 : {
         label$9 : {
          label$11 : {
           if ($1_1) {
            if (!$2_1) {
             break label$11
            }
            break label$9;
           }
           i64toi32_i32$HIGH_BITS = 0;
           return ($0_1 >>> 0) / ($2_1 >>> 0) | 0;
          }
          if (!$0_1) {
           break label$7
          }
          break label$6;
         }
         if (!($2_1 - 1 & $2_1)) {
          break label$5
         }
         $5_1 = (Math_clz32($2_1) + 33 | 0) - Math_clz32($1_1) | 0;
         $6_1 = 0 - $5_1 | 0;
         break label$3;
        }
        i64toi32_i32$HIGH_BITS = 0;
        return ($1_1 >>> 0) / 0 | 0;
       }
       $3_1 = 32 - Math_clz32($1_1) | 0;
       if ($3_1 >>> 0 < 31) {
        break label$4
       }
       break label$2;
      }
      if (($2_1 | 0) == 1) {
       break label$1
      }
      $5_1 = $2_1 ? 31 - Math_clz32($2_1 - 1 ^ $2_1) | 0 : 32;
      $2_1 = $5_1 & 31;
      if (($5_1 & 63) >>> 0 >= 32) {
       $0_1 = $1_1 >>> $2_1 | 0
      } else {
       $3_1 = $1_1 >>> $2_1 | 0;
       $0_1 = ((1 << $2_1) - 1 & $1_1) << 32 - $2_1 | $0_1 >>> $2_1;
      }
      i64toi32_i32$HIGH_BITS = $3_1;
      return $0_1;
     }
     $5_1 = $3_1 + 1 | 0;
     $6_1 = 63 - $3_1 | 0;
    }
    $3_1 = $5_1 & 63;
    $4_1 = $3_1 & 31;
    if ($3_1 >>> 0 >= 32) {
     $3_1 = 0;
     $8_1 = $1_1 >>> $4_1 | 0;
    } else {
     $3_1 = $1_1 >>> $4_1 | 0;
     $8_1 = ((1 << $4_1) - 1 & $1_1) << 32 - $4_1 | $0_1 >>> $4_1;
    }
    $6_1 = $6_1 & 63;
    $4_1 = $6_1 & 31;
    if ($6_1 >>> 0 >= 32) {
     $1_1 = $0_1 << $4_1;
     $0_1 = 0;
    } else {
     $1_1 = (1 << $4_1) - 1 & $0_1 >>> 32 - $4_1 | $1_1 << $4_1;
     $0_1 = $0_1 << $4_1;
    }
    if ($5_1) {
     $6_1 = $2_1 - 1 | 0;
     $10_1 = ($6_1 | 0) == -1 ? -1 : 0;
     while (1) {
      $7_1 = $3_1 << 1 | $8_1 >>> 31;
      $3_1 = $8_1 << 1 | $1_1 >>> 31;
      $4_1 = $10_1 - ($7_1 + ($3_1 >>> 0 > $6_1 >>> 0) | 0) >> 31;
      $9 = $2_1 & $4_1;
      $8_1 = $3_1 - $9 | 0;
      $3_1 = $7_1 - ($3_1 >>> 0 < $9 >>> 0) | 0;
      $1_1 = $1_1 << 1 | $0_1 >>> 31;
      $0_1 = $11_1 | $0_1 << 1;
      $7_1 = $4_1 & 1;
      $11_1 = $7_1;
      $5_1 = $5_1 - 1 | 0;
      if ($5_1) {
       continue
      }
      break;
     };
    }
    i64toi32_i32$HIGH_BITS = $1_1 << 1 | $0_1 >>> 31;
    return $7_1 | $0_1 << 1;
   }
   $0_1 = 0;
   $1_1 = 0;
  }
  i64toi32_i32$HIGH_BITS = $1_1;
  return $0_1;
 }
 
 function __wasm_i64_mul($0_1, $1_1, $2_1, $3_1) {
  var $4_1 = 0, $5_1 = 0, $6_1 = 0, $7_1 = 0, $8_1 = 0, $9 = 0;
  $4_1 = $2_1 >>> 16 | 0;
  $5_1 = $0_1 >>> 16 | 0;
  $9 = Math_imul($4_1, $5_1);
  $6_1 = $2_1 & 65535;
  $7_1 = $0_1 & 65535;
  $8_1 = Math_imul($6_1, $7_1);
  $5_1 = ($8_1 >>> 16 | 0) + Math_imul($5_1, $6_1) | 0;
  $4_1 = ($5_1 & 65535) + Math_imul($4_1, $7_1) | 0;
  i64toi32_i32$HIGH_BITS = (Math_imul($1_1, $2_1) + $9 | 0) + Math_imul($0_1, $3_1) + ($5_1 >>> 16) + ($4_1 >>> 16) | 0;
  return $8_1 & 65535 | $4_1 << 16;
 }
 
 // EMSCRIPTEN_END_FUNCS
;
 bufferView = HEAPU8;
 initActiveSegments(imports);
 var FUNCTION_TABLE = Table([null, $141, $140, $135, $199, $196, $126, $178, $60, $177, $176, $59, $59, $60, $125, $124, $123, $175, $174, $173, $172, $60, $122, $171, $59, $59, $60, $125, $124, $123, $170, $169, $168, $133, $121, $134, $120, $133, $287, $119, $286, $167, $285, $28, $284, $28, $283, $118, $282, $32, $281, $32, $166, $76, $165, $76, $164, $76, $75, $74, $163, $162, $161, $131, $121, $280, $160, $279, $120, $131, $278, $122, $277, $28, $275, $28, $274, $159, $273, $272, $271, $270, $269, $268, $266, $265, $264, $263, $262, $261, $260, $259, $158, $258, $257, $256, $255, $254, $253, $252, $251, $250, $249, $248, $247, $246, $245, $244, $243, $242, $241, $240, $276, $239, $238, $237, $236, $234, $233, $267, $231, $32, $230, $157, $229, $228, $227, $226, $224, $223, $222, $219, $156, $218, $155, $217, $216, $215, $214, $213, $212, $211, $232, $210, $209, $154, $221, $220, $208, $207, $153, $205, $119, $204, $28, $203, $32, $202, $32, $201, $118, $179, $28, $206, $32, $235, $200, $28, $198, $197, $28, $195, $194, $193, $32, $192, $191, $190, $152, $189, $188, $187, $186, $185, $184, $183, $151, $182, $181, $180, $225, $75, $74, $75, $74, $113, $114, $148, $147, $115, $103, $116, $150, $149, $115, $144, $143, $142, $139, $138, $137, $103]);
 function __wasm_memory_size() {
  return buffer.byteLength >> 16;
 }
 
 function __wasm_memory_grow(pagesToAdd) {
  pagesToAdd = pagesToAdd | 0;
  var oldPages = __wasm_memory_size() | 0;
  var newPages = oldPages + pagesToAdd | 0;
  if ((oldPages < newPages) && (newPages < 65536) && (newPages <= 32768)) {
   var newBuffer = new ArrayBuffer(newPages << 16);
   var newHEAP8 = new Int8Array(newBuffer);
   newHEAP8.set(HEAP8);
   HEAP8 = new Int8Array(newBuffer);
   HEAP16 = new Int16Array(newBuffer);
   HEAP32 = new Int32Array(newBuffer);
   HEAPU8 = new Uint8Array(newBuffer);
   HEAPU16 = new Uint16Array(newBuffer);
   HEAPU32 = new Uint32Array(newBuffer);
   HEAPF32 = new Float32Array(newBuffer);
   HEAPF64 = new Float64Array(newBuffer);
   buffer = newBuffer;
   bufferView = HEAPU8;
  }
  return oldPages;
 }
 
 return {
  "E": Object.create(Object.prototype, {
   "grow": {
    "value": __wasm_memory_grow
   }, 
   "buffer": {
    "get": function () {
     return buffer;
    }
    
   }
  }), 
  "F": $79, 
  "G": $146, 
  "H": $145, 
  "I": $67, 
  "J": FUNCTION_TABLE, 
  "K": $5, 
  "L": $136
 };
}

  return asmFunc(info);
}
  return instantiate
})()

// Patched Emscripten + embind glue (WebAssembly references removed).
var loadYoga = (() => {
  var _scriptDir = '';
  
  return (
function(loadYoga) {
  loadYoga = loadYoga || {};


var h;h||(h=typeof loadYoga !== 'undefined' ? loadYoga : {});var aa,ca;h.ready=new Promise(function(a,b){aa=a;ca=b});var da=Object.assign({},h),q="";"undefined"!=typeof document&&document.currentScript&&(q=document.currentScript.src);_scriptDir&&(q=_scriptDir);0!==q.indexOf("blob:")?q=q.substr(0,q.replace(/[?#].*/,"").lastIndexOf("/")+1):q="";var ea=h.print||console.log.bind(console),v=h.printErr||console.warn.bind(console);Object.assign(h,da);da=null;var w;h.wasmBinary&&(w=h.wasmBinary);
var noExitRuntime=h.noExitRuntime||!0;var fa,ha=!1;function z(a,b,c){c=b+c;for(var d="";!(b>=c);){var e=a[b++];if(!e)break;if(e&128){var f=a[b++]&63;if(192==(e&224))d+=String.fromCharCode((e&31)<<6|f);else{var g=a[b++]&63;e=224==(e&240)?(e&15)<<12|f<<6|g:(e&7)<<18|f<<12|g<<6|a[b++]&63;65536>e?d+=String.fromCharCode(e):(e-=65536,d+=String.fromCharCode(55296|e>>10,56320|e&1023))}}else d+=String.fromCharCode(e)}return d}
var ia,ja,A,C,ka,D,E,la,ma;function na(){var a=fa.buffer;ia=a;h.HEAP8=ja=new Int8Array(a);h.HEAP16=C=new Int16Array(a);h.HEAP32=D=new Int32Array(a);h.HEAPU8=A=new Uint8Array(a);h.HEAPU16=ka=new Uint16Array(a);h.HEAPU32=E=new Uint32Array(a);h.HEAPF32=la=new Float32Array(a);h.HEAPF64=ma=new Float64Array(a)}var oa,pa=[],qa=[],ra=[];function sa(){var a=h.preRun.shift();pa.unshift(a)}var F=0,ta=null,G=null;
function x(a){if(h.onAbort)h.onAbort(a);a="Aborted("+a+")";v(a);ha=!0;a=new Error(a+". Build with -sASSERTIONS for more info.");ca(a);throw a;}function ua(a){return a.startsWith("data:application/octet-stream;base64,")}var H;H="data:application/octet-stream;base64,";if(!ua(H)){var va=H;H=h.locateFile?h.locateFile(va,q):q+va}
function wa(){var a=H;try{if(a==H&&w)return new Uint8Array(w);if(ua(a))try{var b=xa(a.slice(37)),c=new Uint8Array(b.length);for(a=0;a<b.length;++a)c[a]=b.charCodeAt(a);var d=c}catch(f){throw Error("Converting base64 string to bytes failed.");}else d=void 0;var e=d;if(e)return e;throw"both async and sync fetching of the wasm failed";}catch(f){x(f)}}
function ya(){return w||"function"!=typeof fetch?Promise.resolve().then(function(){return wa()}):fetch(H,{credentials:"same-origin"}).then(function(a){if(!a.ok)throw"failed to load wasm binary file at '"+H+"'";return a.arrayBuffer()}).catch(function(){return wa()})}function za(a){for(;0<a.length;)a.shift()(h)}function Aa(a){if(void 0===a)return"_unknown";a=a.replace(/[^a-zA-Z0-9_]/g,"$");var b=a.charCodeAt(0);return 48<=b&&57>=b?"_"+a:a}
function Ba(a,b){a=Aa(a);return function(){return b.apply(this,arguments)}}var J=[{},{value:void 0},{value:null},{value:!0},{value:!1}],Ca=[];function Da(a){var b=Error,c=Ba(a,function(d){this.name=a;this.message=d;d=Error(d).stack;void 0!==d&&(this.stack=this.toString()+"\n"+d.replace(/^Error(:[^\n]*)?\n/,""))});c.prototype=Object.create(b.prototype);c.prototype.constructor=c;c.prototype.toString=function(){return void 0===this.message?this.name:this.name+": "+this.message};return c}var K=void 0;
function L(a){throw new K(a);}var M=a=>{a||L("Cannot use deleted val. handle = "+a);return J[a].value},Ea=a=>{switch(a){case void 0:return 1;case null:return 2;case !0:return 3;case !1:return 4;default:var b=Ca.length?Ca.pop():J.length;J[b]={ga:1,value:a};return b}},Fa=void 0,Ga=void 0;function N(a){for(var b="";A[a];)b+=Ga[A[a++]];return b}var O=[];function Ha(){for(;O.length;){var a=O.pop();a.M.$=!1;a["delete"]()}}var P=void 0,Q={};
function Ia(a,b){for(void 0===b&&L("ptr should not be undefined");a.R;)b=a.ba(b),a=a.R;return b}var R={};function Ja(a){a=Ka(a);var b=N(a);S(a);return b}function La(a,b){var c=R[a];void 0===c&&L(b+" has unknown type "+Ja(a));return c}function Ma(){}var Na=!1;function Oa(a){--a.count.value;0===a.count.value&&(a.T?a.U.W(a.T):a.P.N.W(a.O))}function Pa(a,b,c){if(b===c)return a;if(void 0===c.R)return null;a=Pa(a,b,c.R);return null===a?null:c.na(a)}var Qa={};function Ra(a,b){b=Ia(a,b);return Q[b]}
var Sa=void 0;function Ta(a){throw new Sa(a);}function Ua(a,b){b.P&&b.O||Ta("makeClassHandle requires ptr and ptrType");!!b.U!==!!b.T&&Ta("Both smartPtrType and smartPtr must be specified");b.count={value:1};return T(Object.create(a,{M:{value:b}}))}function T(a){if("undefined"===typeof FinalizationRegistry)return T=b=>b,a;Na=new FinalizationRegistry(b=>{Oa(b.M)});T=b=>{var c=b.M;c.T&&Na.register(b,{M:c},b);return b};Ma=b=>{Na.unregister(b)};return T(a)}var Va={};
function Wa(a){for(;a.length;){var b=a.pop();a.pop()(b)}}function Xa(a){return this.fromWireType(D[a>>2])}var U={},Ya={};function V(a,b,c){function d(k){k=c(k);k.length!==a.length&&Ta("Mismatched type converter count");for(var m=0;m<a.length;++m)W(a[m],k[m])}a.forEach(function(k){Ya[k]=b});var e=Array(b.length),f=[],g=0;b.forEach((k,m)=>{R.hasOwnProperty(k)?e[m]=R[k]:(f.push(k),U.hasOwnProperty(k)||(U[k]=[]),U[k].push(()=>{e[m]=R[k];++g;g===f.length&&d(e)}))});0===f.length&&d(e)}
function Za(a){switch(a){case 1:return 0;case 2:return 1;case 4:return 2;case 8:return 3;default:throw new TypeError("Unknown type size: "+a);}}
function W(a,b,c={}){if(!("argPackAdvance"in b))throw new TypeError("registerType registeredInstance requires argPackAdvance");var d=b.name;a||L('type "'+d+'" must have a positive integer typeid pointer');if(R.hasOwnProperty(a)){if(c.ua)return;L("Cannot register type '"+d+"' twice")}R[a]=b;delete Ya[a];U.hasOwnProperty(a)&&(b=U[a],delete U[a],b.forEach(e=>e()))}function $a(a){L(a.M.P.N.name+" instance already deleted")}function X(){}
function ab(a,b,c){if(void 0===a[b].S){var d=a[b];a[b]=function(){a[b].S.hasOwnProperty(arguments.length)||L("Function '"+c+"' called with an invalid number of arguments ("+arguments.length+") - expects one of ("+a[b].S+")!");return a[b].S[arguments.length].apply(this,arguments)};a[b].S=[];a[b].S[d.Z]=d}}
function bb(a,b){h.hasOwnProperty(a)?(L("Cannot register public name '"+a+"' twice"),ab(h,a,a),h.hasOwnProperty(void 0)&&L("Cannot register multiple overloads of a function with the same number of arguments (undefined)!"),h[a].S[void 0]=b):h[a]=b}function cb(a,b,c,d,e,f,g,k){this.name=a;this.constructor=b;this.X=c;this.W=d;this.R=e;this.pa=f;this.ba=g;this.na=k;this.ja=[]}
function db(a,b,c){for(;b!==c;)b.ba||L("Expected null or instance of "+c.name+", got an instance of "+b.name),a=b.ba(a),b=b.R;return a}function eb(a,b){if(null===b)return this.ea&&L("null is not a valid "+this.name),0;b.M||L('Cannot pass "'+fb(b)+'" as a '+this.name);b.M.O||L("Cannot pass deleted object as a pointer of type "+this.name);return db(b.M.O,b.M.P.N,this.N)}
function gb(a,b){if(null===b){this.ea&&L("null is not a valid "+this.name);if(this.da){var c=this.fa();null!==a&&a.push(this.W,c);return c}return 0}b.M||L('Cannot pass "'+fb(b)+'" as a '+this.name);b.M.O||L("Cannot pass deleted object as a pointer of type "+this.name);!this.ca&&b.M.P.ca&&L("Cannot convert argument of type "+(b.M.U?b.M.U.name:b.M.P.name)+" to parameter type "+this.name);c=db(b.M.O,b.M.P.N,this.N);if(this.da)switch(void 0===b.M.T&&L("Passing raw pointer to smart pointer is illegal"),
this.Ba){case 0:b.M.U===this?c=b.M.T:L("Cannot convert argument of type "+(b.M.U?b.M.U.name:b.M.P.name)+" to parameter type "+this.name);break;case 1:c=b.M.T;break;case 2:if(b.M.U===this)c=b.M.T;else{var d=b.clone();c=this.xa(c,Ea(function(){d["delete"]()}));null!==a&&a.push(this.W,c)}break;default:L("Unsupporting sharing policy")}return c}
function hb(a,b){if(null===b)return this.ea&&L("null is not a valid "+this.name),0;b.M||L('Cannot pass "'+fb(b)+'" as a '+this.name);b.M.O||L("Cannot pass deleted object as a pointer of type "+this.name);b.M.P.ca&&L("Cannot convert argument of type "+b.M.P.name+" to parameter type "+this.name);return db(b.M.O,b.M.P.N,this.N)}
function Y(a,b,c,d){this.name=a;this.N=b;this.ea=c;this.ca=d;this.da=!1;this.W=this.xa=this.fa=this.ka=this.Ba=this.wa=void 0;void 0!==b.R?this.toWireType=gb:(this.toWireType=d?eb:hb,this.V=null)}function ib(a,b){h.hasOwnProperty(a)||Ta("Replacing nonexistant public symbol");h[a]=b;h[a].Z=void 0}
function jb(a,b){var c=[];return function(){c.length=0;Object.assign(c,arguments);if(a.includes("j")){var d=h["dynCall_"+a];d=c&&c.length?d.apply(null,[b].concat(c)):d.call(null,b)}else d=oa.get(b).apply(null,c);return d}}function Z(a,b){a=N(a);var c=a.includes("j")?jb(a,b):oa.get(b);"function"!=typeof c&&L("unknown function pointer with signature "+a+": "+b);return c}var mb=void 0;
function nb(a,b){function c(f){e[f]||R[f]||(Ya[f]?Ya[f].forEach(c):(d.push(f),e[f]=!0))}var d=[],e={};b.forEach(c);throw new mb(a+": "+d.map(Ja).join([", "]));}
function ob(a,b,c,d,e){var f=b.length;2>f&&L("argTypes array size mismatch! Must at least get return value and 'this' types!");var g=null!==b[1]&&null!==c,k=!1;for(c=1;c<b.length;++c)if(null!==b[c]&&void 0===b[c].V){k=!0;break}var m="void"!==b[0].name,l=f-2,n=Array(l),p=[],r=[];return function(){arguments.length!==l&&L("function "+a+" called with "+arguments.length+" arguments, expected "+l+" args!");r.length=0;p.length=g?2:1;p[0]=e;if(g){var u=b[1].toWireType(r,this);p[1]=u}for(var t=0;t<l;++t)n[t]=
b[t+2].toWireType(r,arguments[t]),p.push(n[t]);t=d.apply(null,p);if(k)Wa(r);else for(var y=g?1:2;y<b.length;y++){var B=1===y?u:n[y-2];null!==b[y].V&&b[y].V(B)}u=m?b[0].fromWireType(t):void 0;return u}}function pb(a,b){for(var c=[],d=0;d<a;d++)c.push(E[b+4*d>>2]);return c}function qb(a){4<a&&0===--J[a].ga&&(J[a]=void 0,Ca.push(a))}function fb(a){if(null===a)return"null";var b=typeof a;return"object"===b||"array"===b||"function"===b?a.toString():""+a}
function rb(a,b){switch(b){case 2:return function(c){return this.fromWireType(la[c>>2])};case 3:return function(c){return this.fromWireType(ma[c>>3])};default:throw new TypeError("Unknown float type: "+a);}}
function sb(a,b,c){switch(b){case 0:return c?function(d){return ja[d]}:function(d){return A[d]};case 1:return c?function(d){return C[d>>1]}:function(d){return ka[d>>1]};case 2:return c?function(d){return D[d>>2]}:function(d){return E[d>>2]};default:throw new TypeError("Unknown integer type: "+a);}}function tb(a,b){for(var c="",d=0;!(d>=b/2);++d){var e=C[a+2*d>>1];if(0==e)break;c+=String.fromCharCode(e)}return c}
function ub(a,b,c){void 0===c&&(c=2147483647);if(2>c)return 0;c-=2;var d=b;c=c<2*a.length?c/2:a.length;for(var e=0;e<c;++e)C[b>>1]=a.charCodeAt(e),b+=2;C[b>>1]=0;return b-d}function vb(a){return 2*a.length}function wb(a,b){for(var c=0,d="";!(c>=b/4);){var e=D[a+4*c>>2];if(0==e)break;++c;65536<=e?(e-=65536,d+=String.fromCharCode(55296|e>>10,56320|e&1023)):d+=String.fromCharCode(e)}return d}
function xb(a,b,c){void 0===c&&(c=2147483647);if(4>c)return 0;var d=b;c=d+c-4;for(var e=0;e<a.length;++e){var f=a.charCodeAt(e);if(55296<=f&&57343>=f){var g=a.charCodeAt(++e);f=65536+((f&1023)<<10)|g&1023}D[b>>2]=f;b+=4;if(b+4>c)break}D[b>>2]=0;return b-d}function yb(a){for(var b=0,c=0;c<a.length;++c){var d=a.charCodeAt(c);55296<=d&&57343>=d&&++c;b+=4}return b}var zb={};function Ab(a){var b=zb[a];return void 0===b?N(a):b}var Bb=[];function Cb(a){var b=Bb.length;Bb.push(a);return b}
function Db(a,b){for(var c=Array(a),d=0;d<a;++d)c[d]=La(E[b+4*d>>2],"parameter "+d);return c}var Eb=[],Fb=[null,[],[]];K=h.BindingError=Da("BindingError");h.count_emval_handles=function(){for(var a=0,b=5;b<J.length;++b)void 0!==J[b]&&++a;return a};h.get_first_emval=function(){for(var a=5;a<J.length;++a)if(void 0!==J[a])return J[a];return null};Fa=h.PureVirtualError=Da("PureVirtualError");for(var Gb=Array(256),Hb=0;256>Hb;++Hb)Gb[Hb]=String.fromCharCode(Hb);Ga=Gb;h.getInheritedInstanceCount=function(){return Object.keys(Q).length};
h.getLiveInheritedInstances=function(){var a=[],b;for(b in Q)Q.hasOwnProperty(b)&&a.push(Q[b]);return a};h.flushPendingDeletes=Ha;h.setDelayFunction=function(a){P=a;O.length&&P&&P(Ha)};Sa=h.InternalError=Da("InternalError");X.prototype.isAliasOf=function(a){if(!(this instanceof X&&a instanceof X))return!1;var b=this.M.P.N,c=this.M.O,d=a.M.P.N;for(a=a.M.O;b.R;)c=b.ba(c),b=b.R;for(;d.R;)a=d.ba(a),d=d.R;return b===d&&c===a};
X.prototype.clone=function(){this.M.O||$a(this);if(this.M.aa)return this.M.count.value+=1,this;var a=T,b=Object,c=b.create,d=Object.getPrototypeOf(this),e=this.M;a=a(c.call(b,d,{M:{value:{count:e.count,$:e.$,aa:e.aa,O:e.O,P:e.P,T:e.T,U:e.U}}}));a.M.count.value+=1;a.M.$=!1;return a};X.prototype["delete"]=function(){this.M.O||$a(this);this.M.$&&!this.M.aa&&L("Object already scheduled for deletion");Ma(this);Oa(this.M);this.M.aa||(this.M.T=void 0,this.M.O=void 0)};X.prototype.isDeleted=function(){return!this.M.O};
X.prototype.deleteLater=function(){this.M.O||$a(this);this.M.$&&!this.M.aa&&L("Object already scheduled for deletion");O.push(this);1===O.length&&P&&P(Ha);this.M.$=!0;return this};Y.prototype.qa=function(a){this.ka&&(a=this.ka(a));return a};Y.prototype.ha=function(a){this.W&&this.W(a)};Y.prototype.argPackAdvance=8;Y.prototype.readValueFromPointer=Xa;Y.prototype.deleteObject=function(a){if(null!==a)a["delete"]()};
Y.prototype.fromWireType=function(a){function b(){return this.da?Ua(this.N.X,{P:this.wa,O:c,U:this,T:a}):Ua(this.N.X,{P:this,O:a})}var c=this.qa(a);if(!c)return this.ha(a),null;var d=Ra(this.N,c);if(void 0!==d){if(0===d.M.count.value)return d.M.O=c,d.M.T=a,d.clone();d=d.clone();this.ha(a);return d}d=this.N.pa(c);d=Qa[d];if(!d)return b.call(this);d=this.ca?d.la:d.pointerType;var e=Pa(c,this.N,d.N);return null===e?b.call(this):this.da?Ua(d.N.X,{P:d,O:e,U:this,T:a}):Ua(d.N.X,{P:d,O:e})};
mb=h.UnboundTypeError=Da("UnboundTypeError");
var xa="function"==typeof atob?atob:function(a){var b="",c=0;a=a.replace(/[^A-Za-z0-9\+\/=]/g,"");do{var d="ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=".indexOf(a.charAt(c++));var e="ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=".indexOf(a.charAt(c++));var f="ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=".indexOf(a.charAt(c++));var g="ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=".indexOf(a.charAt(c++));d=d<<2|e>>4;
e=(e&15)<<4|f>>2;var k=(f&3)<<6|g;b+=String.fromCharCode(d);64!==f&&(b+=String.fromCharCode(e));64!==g&&(b+=String.fromCharCode(k))}while(c<a.length);return b},Jb={l:function(a,b,c,d){x("Assertion failed: "+(a?z(A,a):"")+", at: "+[b?b?z(A,b):"":"unknown filename",c,d?d?z(A,d):"":"unknown function"])},q:function(a,b,c){a=N(a);b=La(b,"wrapper");c=M(c);var d=[].slice,e=b.N,f=e.X,g=e.R.X,k=e.R.constructor;a=Ba(a,function(){e.R.ja.forEach(function(l){if(this[l]===g[l])throw new Fa("Pure virtual function "+
l+" must be implemented in JavaScript");}.bind(this));Object.defineProperty(this,"__parent",{value:f});this.__construct.apply(this,d.call(arguments))});f.__construct=function(){this===f&&L("Pass correct 'this' to __construct");var l=k.implement.apply(void 0,[this].concat(d.call(arguments)));Ma(l);var n=l.M;l.notifyOnDestruction();n.aa=!0;Object.defineProperties(this,{M:{value:n}});T(this);l=n.O;l=Ia(e,l);Q.hasOwnProperty(l)?L("Tried to register registered instance: "+l):Q[l]=this};f.__destruct=function(){this===
f&&L("Pass correct 'this' to __destruct");Ma(this);var l=this.M.O;l=Ia(e,l);Q.hasOwnProperty(l)?delete Q[l]:L("Tried to unregister unregistered instance: "+l)};a.prototype=Object.create(f);for(var m in c)a.prototype[m]=c[m];return Ea(a)},j:function(a){var b=Va[a];delete Va[a];var c=b.fa,d=b.W,e=b.ia,f=e.map(g=>g.ta).concat(e.map(g=>g.za));V([a],f,g=>{var k={};e.forEach((m,l)=>{var n=g[l],p=m.ra,r=m.sa,u=g[l+e.length],t=m.ya,y=m.Aa;k[m.oa]={read:B=>n.fromWireType(p(r,B)),write:(B,ba)=>{var I=[];t(y,
B,u.toWireType(I,ba));Wa(I)}}});return[{name:b.name,fromWireType:function(m){var l={},n;for(n in k)l[n]=k[n].read(m);d(m);return l},toWireType:function(m,l){for(var n in k)if(!(n in l))throw new TypeError('Missing field:  "'+n+'"');var p=c();for(n in k)k[n].write(p,l[n]);null!==m&&m.push(d,p);return p},argPackAdvance:8,readValueFromPointer:Xa,V:d}]})},v:function(){},B:function(a,b,c,d,e){var f=Za(c);b=N(b);W(a,{name:b,fromWireType:function(g){return!!g},toWireType:function(g,k){return k?d:e},argPackAdvance:8,
readValueFromPointer:function(g){if(1===c)var k=ja;else if(2===c)k=C;else if(4===c)k=D;else throw new TypeError("Unknown boolean type size: "+b);return this.fromWireType(k[g>>f])},V:null})},f:function(a,b,c,d,e,f,g,k,m,l,n,p,r){n=N(n);f=Z(e,f);k&&(k=Z(g,k));l&&(l=Z(m,l));r=Z(p,r);var u=Aa(n);bb(u,function(){nb("Cannot construct "+n+" due to unbound types",[d])});V([a,b,c],d?[d]:[],function(t){t=t[0];if(d){var y=t.N;var B=y.X}else B=X.prototype;t=Ba(u,function(){if(Object.getPrototypeOf(this)!==ba)throw new K("Use 'new' to construct "+
n);if(void 0===I.Y)throw new K(n+" has no accessible constructor");var kb=I.Y[arguments.length];if(void 0===kb)throw new K("Tried to invoke ctor of "+n+" with invalid number of parameters ("+arguments.length+") - expected ("+Object.keys(I.Y).toString()+") parameters instead!");return kb.apply(this,arguments)});var ba=Object.create(B,{constructor:{value:t}});t.prototype=ba;var I=new cb(n,t,ba,r,y,f,k,l);y=new Y(n,I,!0,!1);B=new Y(n+"*",I,!1,!1);var lb=new Y(n+" const*",I,!1,!0);Qa[a]={pointerType:B,
la:lb};ib(u,t);return[y,B,lb]})},d:function(a,b,c,d,e,f,g){var k=pb(c,d);b=N(b);f=Z(e,f);V([],[a],function(m){function l(){nb("Cannot call "+n+" due to unbound types",k)}m=m[0];var n=m.name+"."+b;b.startsWith("@@")&&(b=Symbol[b.substring(2)]);var p=m.N.constructor;void 0===p[b]?(l.Z=c-1,p[b]=l):(ab(p,b,n),p[b].S[c-1]=l);V([],k,function(r){r=ob(n,[r[0],null].concat(r.slice(1)),null,f,g);void 0===p[b].S?(r.Z=c-1,p[b]=r):p[b].S[c-1]=r;return[]});return[]})},p:function(a,b,c,d,e,f){0<b||x();var g=pb(b,
c);e=Z(d,e);V([],[a],function(k){k=k[0];var m="constructor "+k.name;void 0===k.N.Y&&(k.N.Y=[]);if(void 0!==k.N.Y[b-1])throw new K("Cannot register multiple constructors with identical number of parameters ("+(b-1)+") for class '"+k.name+"'! Overload resolution is currently only performed using the parameter count, not actual type info!");k.N.Y[b-1]=()=>{nb("Cannot construct "+k.name+" due to unbound types",g)};V([],g,function(l){l.splice(1,0,null);k.N.Y[b-1]=ob(m,l,null,e,f);return[]});return[]})},
a:function(a,b,c,d,e,f,g,k){var m=pb(c,d);b=N(b);f=Z(e,f);V([],[a],function(l){function n(){nb("Cannot call "+p+" due to unbound types",m)}l=l[0];var p=l.name+"."+b;b.startsWith("@@")&&(b=Symbol[b.substring(2)]);k&&l.N.ja.push(b);var r=l.N.X,u=r[b];void 0===u||void 0===u.S&&u.className!==l.name&&u.Z===c-2?(n.Z=c-2,n.className=l.name,r[b]=n):(ab(r,b,p),r[b].S[c-2]=n);V([],m,function(t){t=ob(p,t,l,f,g);void 0===r[b].S?(t.Z=c-2,r[b]=t):r[b].S[c-2]=t;return[]});return[]})},A:function(a,b){b=N(b);W(a,
{name:b,fromWireType:function(c){var d=M(c);qb(c);return d},toWireType:function(c,d){return Ea(d)},argPackAdvance:8,readValueFromPointer:Xa,V:null})},n:function(a,b,c){c=Za(c);b=N(b);W(a,{name:b,fromWireType:function(d){return d},toWireType:function(d,e){return e},argPackAdvance:8,readValueFromPointer:rb(b,c),V:null})},e:function(a,b,c,d,e){b=N(b);-1===e&&(e=4294967295);e=Za(c);var f=k=>k;if(0===d){var g=32-8*c;f=k=>k<<g>>>g}c=b.includes("unsigned")?function(k,m){return m>>>0}:function(k,m){return m};
W(a,{name:b,fromWireType:f,toWireType:c,argPackAdvance:8,readValueFromPointer:sb(b,e,0!==d),V:null})},b:function(a,b,c){function d(f){f>>=2;var g=E;return new e(ia,g[f+1],g[f])}var e=[Int8Array,Uint8Array,Int16Array,Uint16Array,Int32Array,Uint32Array,Float32Array,Float64Array][b];c=N(c);W(a,{name:c,fromWireType:d,argPackAdvance:8,readValueFromPointer:d},{ua:!0})},o:function(a,b){b=N(b);var c="std::string"===b;W(a,{name:b,fromWireType:function(d){var e=E[d>>2],f=d+4;if(c)for(var g=f,k=0;k<=e;++k){var m=
f+k;if(k==e||0==A[m]){g=g?z(A,g,m-g):"";if(void 0===l)var l=g;else l+=String.fromCharCode(0),l+=g;g=m+1}}else{l=Array(e);for(k=0;k<e;++k)l[k]=String.fromCharCode(A[f+k]);l=l.join("")}S(d);return l},toWireType:function(d,e){e instanceof ArrayBuffer&&(e=new Uint8Array(e));var f,g="string"==typeof e;g||e instanceof Uint8Array||e instanceof Uint8ClampedArray||e instanceof Int8Array||L("Cannot pass non-string to std::string");if(c&&g){var k=0;for(f=0;f<e.length;++f){var m=e.charCodeAt(f);127>=m?k++:2047>=
m?k+=2:55296<=m&&57343>=m?(k+=4,++f):k+=3}f=k}else f=e.length;k=Ib(4+f+1);m=k+4;E[k>>2]=f;if(c&&g){if(g=m,m=f+1,f=A,0<m){m=g+m-1;for(var l=0;l<e.length;++l){var n=e.charCodeAt(l);if(55296<=n&&57343>=n){var p=e.charCodeAt(++l);n=65536+((n&1023)<<10)|p&1023}if(127>=n){if(g>=m)break;f[g++]=n}else{if(2047>=n){if(g+1>=m)break;f[g++]=192|n>>6}else{if(65535>=n){if(g+2>=m)break;f[g++]=224|n>>12}else{if(g+3>=m)break;f[g++]=240|n>>18;f[g++]=128|n>>12&63}f[g++]=128|n>>6&63}f[g++]=128|n&63}}f[g]=0}}else if(g)for(g=
0;g<f;++g)l=e.charCodeAt(g),255<l&&(S(m),L("String has UTF-16 code units that do not fit in 8 bits")),A[m+g]=l;else for(g=0;g<f;++g)A[m+g]=e[g];null!==d&&d.push(S,k);return k},argPackAdvance:8,readValueFromPointer:Xa,V:function(d){S(d)}})},i:function(a,b,c){c=N(c);if(2===b){var d=tb;var e=ub;var f=vb;var g=()=>ka;var k=1}else 4===b&&(d=wb,e=xb,f=yb,g=()=>E,k=2);W(a,{name:c,fromWireType:function(m){for(var l=E[m>>2],n=g(),p,r=m+4,u=0;u<=l;++u){var t=m+4+u*b;if(u==l||0==n[t>>k])r=d(r,t-r),void 0===
p?p=r:(p+=String.fromCharCode(0),p+=r),r=t+b}S(m);return p},toWireType:function(m,l){"string"!=typeof l&&L("Cannot pass non-string to C++ string type "+c);var n=f(l),p=Ib(4+n+b);E[p>>2]=n>>k;e(l,p+4,n+b);null!==m&&m.push(S,p);return p},argPackAdvance:8,readValueFromPointer:Xa,V:function(m){S(m)}})},k:function(a,b,c,d,e,f){Va[a]={name:N(b),fa:Z(c,d),W:Z(e,f),ia:[]}},h:function(a,b,c,d,e,f,g,k,m,l){Va[a].ia.push({oa:N(b),ta:c,ra:Z(d,e),sa:f,za:g,ya:Z(k,m),Aa:l})},C:function(a,b){b=N(b);W(a,{va:!0,name:b,
argPackAdvance:0,fromWireType:function(){},toWireType:function(){}})},s:function(a,b,c,d,e){a=Bb[a];b=M(b);c=Ab(c);var f=[];E[d>>2]=Ea(f);return a(b,c,f,e)},t:function(a,b,c,d){a=Bb[a];b=M(b);c=Ab(c);a(b,c,null,d)},g:qb,m:function(a,b){var c=Db(a,b),d=c[0];b=d.name+"_$"+c.slice(1).map(function(g){return g.name}).join("_")+"$";var e=Eb[b];if(void 0!==e)return e;var f=Array(a-1);e=Cb((g,k,m,l)=>{for(var n=0,p=0;p<a-1;++p)f[p]=c[p+1].readValueFromPointer(l+n),n+=c[p+1].argPackAdvance;g=g[k].apply(g,
f);for(p=0;p<a-1;++p)c[p+1].ma&&c[p+1].ma(f[p]);if(!d.va)return d.toWireType(m,g)});return Eb[b]=e},D:function(a){4<a&&(J[a].ga+=1)},r:function(a){var b=M(a);Wa(b);qb(a)},c:function(){x("")},x:function(a,b,c){A.copyWithin(a,b,b+c)},w:function(a){var b=A.length;a>>>=0;if(2147483648<a)return!1;for(var c=1;4>=c;c*=2){var d=b*(1+.2/c);d=Math.min(d,a+100663296);var e=Math;d=Math.max(a,d);e=e.min.call(e,2147483648,d+(65536-d%65536)%65536);a:{try{fa.grow(e-ia.byteLength+65535>>>16);na();var f=1;break a}catch(g){}f=
void 0}if(f)return!0}return!1},z:function(){return 52},u:function(){return 70},y:function(a,b,c,d){for(var e=0,f=0;f<c;f++){var g=E[b>>2],k=E[b+4>>2];b+=8;for(var m=0;m<k;m++){var l=A[g+m],n=Fb[a];0===l||10===l?((1===a?ea:v)(z(n,0)),n.length=0):n.push(l)}e+=k}E[d>>2]=e;return 0}};
(function(){function a(e){h.asm=e.exports;fa=h.asm.E;na();oa=h.asm.J;qa.unshift(h.asm.F);F--;h.monitorRunDependencies&&h.monitorRunDependencies(F);0==F&&(null!==ta&&(clearInterval(ta),ta=null),G&&(e=G,G=null,e()))}function b(e){a(e.instance)}function c(e){return ya().then(function(f){throw new Error("WebAssembly is not available (asm.js build)")}).then(function(f){return f}).then(e,function(f){v("failed to asynchronously prepare wasm: "+f);x(f)})}var d={a:Jb};F++;h.monitorRunDependencies&&h.monitorRunDependencies(F);if(h.instantiateWasm)try{return h.instantiateWasm(d,
a)}catch(e){v("Module.instantiateWasm callback failed with error: "+e),ca(e)}(function(){return Promise.reject(new Error("WebAssembly is not available (asm.js build)"))})().catch(ca);return{}})();
h.___wasm_call_ctors=function(){return(h.___wasm_call_ctors=h.asm.F).apply(null,arguments)};var Ka=h.___getTypeName=function(){return(Ka=h.___getTypeName=h.asm.G).apply(null,arguments)};h.__embind_initialize_bindings=function(){return(h.__embind_initialize_bindings=h.asm.H).apply(null,arguments)};var Ib=h._malloc=function(){return(Ib=h._malloc=h.asm.I).apply(null,arguments)},S=h._free=function(){return(S=h._free=h.asm.K).apply(null,arguments)};
h.dynCall_jiji=function(){return(h.dynCall_jiji=h.asm.L).apply(null,arguments)};var Kb;G=function Lb(){Kb||Mb();Kb||(G=Lb)};
function Mb(){function a(){if(!Kb&&(Kb=!0,h.calledRun=!0,!ha)){za(qa);aa(h);if(h.onRuntimeInitialized)h.onRuntimeInitialized();if(h.postRun)for("function"==typeof h.postRun&&(h.postRun=[h.postRun]);h.postRun.length;){var b=h.postRun.shift();ra.unshift(b)}za(ra)}}if(!(0<F)){if(h.preRun)for("function"==typeof h.preRun&&(h.preRun=[h.preRun]);h.preRun.length;)sa();za(pa);0<F||(h.setStatus?(h.setStatus("Running..."),setTimeout(function(){setTimeout(function(){h.setStatus("")},1);a()},1)):a())}}
if(h.preInit)for("function"==typeof h.preInit&&(h.preInit=[h.preInit]);0<h.preInit.length;)h.preInit.pop()();Mb();


  return loadYoga.ready
}
);
})();

/**
 * Create a fully initialized Yoga instance synchronously. The Emscripten glue still returns a promise,
 * but with `instantiateWasm` supplied synchronously the module is complete before the factory returns.
 */
export function createYogaAsm() {
  const module = {
    print() {},
    printErr() {},
    instantiateWasm(imports, receiveInstance) {
      receiveInstance({ exports: instantiateAsm(imports) })
      return {}
    },
  }
  const ready = loadYoga(module)
  if (!module.calledRun) throw new Error('[three-ui] asm.js Yoga did not initialize synchronously')
  ready.catch(() => {})
  return wrapAssembly(module)
}
