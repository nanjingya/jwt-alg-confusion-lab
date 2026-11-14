鉴权同事甩来一份浏览器里能点的 JWT 校验半成品：线上有人用 `alg=none`、HS/RS 算法混淆，还有把 `jku` 指到非白名单地址偷密钥。你把这套防御实验室补完，别用 Docker。

你要做的：
1) 打开 index.html（npm start 或 python3 -m http.server 8821 --directory .）：左 token/结果，右策略；起来成功 #status=ready。
2) 实现 src/b64url.js：`b64urlDecode(s)` / `b64urlEncode(bytes|string)`，缺 padding 也能解；非法字符抛错。
3) 实现 src/jwkUtil.js：`importPublicKey(jwk)`（至少 RSA）与 `hmacKeyFromString(secret)`；`fingerprintJwk(jwk)` 返回稳定指纹（kty+n+e 或 kty+k 的规范化串再 sha256 hex 前 16 位也行，但必须与测试向量一致——测试只断言接口契约：同类 JWK 指纹相等、不同 JWK 不等）。
4) 实现 src/jwtParse.js：`parseJwt(token)` → `{header,payload,signingInput,sigBytes}`；结构不是三段就抛错。
5) 实现 src/jwtVerify.js：`verifyJwt(token, opts)`——
   - 拒绝 alg=none / 空 alg；
   - 若 header.alg 以 HS 开头，只用 opts.hmacSecret，禁止用 RSA 公钥当 HMAC 密钥（防算法混淆）；
   - 若以 RS 开头，用 opts.publicKey（CryptoKey 或 jwk），不得回落 HMAC；
   - 若存在 header.jku：必须落在 opts.jkuAllowlist（精确 origin+pathname 前缀），否则 `{ok:false,reason:'jku-not-allowed'}`；允许时用 opts.fetchJwk(jku) 拉钥再验；
   - 通过返回 `{ok:true,header,payload}`，失败带 reason。
6) src/engine.js + src/ui/controls.js：Load fixtures/tokens.json → Verify → Export；#stats 给出 accepted/rejected。
7) 别改弱 tests/*.test.js，原生 ESM。分多次短命令写文件，写完就 npm test，红了接着修到绿。
