# 4Link 签名与发布凭证

本文档记录 Android 与 Windows 产物的签名方式、所需凭证，以及丢失密钥后的补救办法。

| 平台 | 产物 | 签名方式 | 状态 |
| --- | --- | --- | --- |
| Web | `4link-dist.zip` | 不需要 | — |
| Android | `4Link-x.y.z-android.apk` | 自持 JKS 密钥库（GitHub Secrets） | 已配置 |
| Windows | `4Link-x.y.z-portable.exe` / `-setup.exe` | SignPath.io 云签名（开源免费） | 待申请 |

---

## 一、Android 签名

### 当前密钥

| 项目 | 值 |
| --- | --- |
| 密钥库类型 | PKCS12 |
| Alias | `4link` |
| 有效期 | 10000 天 |
| SHA-256 指纹 | `43:9D:A9:AB:A2:79:4B:09:C1:B8:A9:53:1B:30:39:E0:19:88:C1:95:0B:C1:4D:6A:7F:8B:3D:13:59:50:6A:1F` |

密钥库文件与密码**不在仓库内，也不在 CI 里**，只以 Base64 形式存放在 GitHub Secrets。
拿到 APK 后可用以下命令核对指纹是否一致：

```bash
apksigner verify --print-certs 4Link-1.0.0-android.apk
```

### 仓库配置

`Settings → Secrets and variables → Actions → Secrets`：

| 名称 | 内容 |
| --- | --- |
| `ANDROID_KEYSTORE_BASE64` | 密钥库文件的 Base64（单行，无换行） |
| `ANDROID_KEYSTORE_PASSWORD` | 密钥库密码 |
| `ANDROID_KEY_ALIAS` | `4link` |
| `ANDROID_KEY_PASSWORD` | 密钥密码（PKCS12 下与库密码相同） |

CI 行为见 `.github/workflows/deploy.yml` 的 `android` job：检测到 `ANDROID_KEYSTORE_BASE64`
就解码使用，否则临时生成一次性 debug 密钥兜底。

### 重新生成密钥

```bash
keytool -genkeypair -keystore 4link-release.jks -storetype PKCS12 \
  -alias 4link -keyalg RSA -keysize 2048 -validity 10000 \
  -dname "CN=4Link, O=4Link, C=CN"
```

```powershell
# Windows：转 Base64 后填入 ANDROID_KEYSTORE_BASE64
[Convert]::ToBase64String([System.IO.File]::ReadAllBytes("4link-release.jks"))
```

> ⚠️ **换密钥 = 换签名**。已发布的 APK 将无法覆盖升级，用户必须先卸载重装；
> 若要上架应用商店，只能更换 `applicationId` 以新应用身份提交。

> ⚠️ **GitHub Secrets 只能写入、无法读回**，不能当作备份。密钥库与密码必须另存到离线介质
> （U 盘、密码管理器、加密网盘）。

---

## 二、Windows 签名（SignPath）

Windows 代码签名自 2023 年起要求私钥存放在 FIPS 140-2 Level 2 硬件或云 HSM 中，
因此无法再「买证书 → 下载 pfx → 塞进 Secrets」。对开源项目，SignPath Foundation
提供免费的云端签名，私钥始终留在 SignPath 的 HSM 内，CI 只提交待签产物。

### 1. 申请

1. 在 <https://signpath.org/apply> 提交开源项目申请，填写仓库地址（公开仓库 + OSI 认可许可证，本项目为 MIT）。
2. 审核通过后会收到 SignPath 组织邀请，注册账号并加入组织。
3. 在 GitHub 安装 [SignPath GitHub App](https://github.com/apps/signpath)，授予本仓库访问权限。

### 2. 在 SignPath 控制台配置

1. **Trusted Build System**：确认组织已添加 `GitHub.com`，并关联到下面的项目。
2. **Project**：新建项目，slug 例如 `4link`。
3. **Signing Policy**：新建策略（例如 `release-signing`），类型选 *Release signing*；
   如需人工审批，把审批人设为自己。
4. **Artifact Configuration**：新建配置，slug 例如 `windows-exe`，内容使用
   [`docs/signpath-artifact-configuration.xml`](signpath-artifact-configuration.xml)。
   该配置假定上传的产物是一个 ZIP，根目录直接放着 `*.exe`。
5. **API Token**：在用户设置里创建，勾选 *Submitter* 权限。

### 3. 写入 GitHub 凭证

`Settings → Secrets and variables → Actions`：

| 类型 | 名称 | 值 |
| --- | --- | --- |
| Secret | `SIGNPATH_API_TOKEN` | SignPath 生成的 API Token |
| Variable | `SIGNPATH_ORGANIZATION_ID` | SignPath 组织 ID（控制台 URL 中可见） |
| Variable | `SIGNPATH_PROJECT_SLUG` | 例如 `4link` |
| Variable | `SIGNPATH_SIGNING_POLICY_SLUG` | 例如 `release-signing` |
| Variable | `SIGNPATH_ARTIFACT_CONFIGURATION_SLUG` | 例如 `windows-exe` |

### 4. CI 行为

`desktop` job 的流程：

1. `electron-builder` 产出未签名的 portable / setup EXE；
2. 先把未签名文件上传为 GitHub 产物 `4link-windows-unsigned`（SignPath 要求产物先存在于 GitHub）；
3. 若 `SIGNPATH_API_TOKEN` 与组织 ID 均已配置，提交签名请求并等待完成，把签名后的 EXE 取回；
   任一凭证缺失则自动跳过，直接使用未签名文件；
4. 统一以 `4link-desktop` 产物上传，`release` job 不区分是否签名。

### 5. 验证签名

```powershell
Get-AuthenticodeSignature .\4Link-1.0.0-portable.exe | Format-List Status, SignerCertificate
```

`Status` 应为 `Valid`。CI 的 *Collect signed binaries* 步骤也会打印同样信息。

### 注意事项

- SignPath 开源计划要求**所有前置 job 都跑在 GitHub 托管 runner** 上，本项目满足；将来若改用自建 runner 会签名失败。
- 免费额度对同一提交的重跑有限制（策略评估最多 3 次），失败重跑过多需要重新触发 workflow。
- 签名不等同于「立刻没有 SmartScreen 提示」：新证书需要累计下载信誉，EV 或云签名通常比传统 OV 更快建立信誉。
- NSIS 安装包内部还嵌有应用本体，SignPath 的 *deep signing* 可以一并签，但对外层安装包签名已足够消除「未知发布者」。

---

## 三、本地自签名（仅测试用）

如果只想验证签名流程而不申请证书，可以在 Windows 上生成自签名证书：

```powershell
$cert = New-SelfSignedCertificate -Type CodeSigningCert -Subject "CN=4Link Dev" `
  -CertStoreLocation Cert:\CurrentUser\My -HashAlgorithm SHA256
Set-AuthenticodeSignature .\4Link-1.0.0-portable.exe -Certificate $cert
```

> 自签名证书对 SmartScreen **没有任何帮助**，其他电脑上仍会显示「未知发布者」。
> 仅用于本地验证签名逻辑，不要用于正式发布。
