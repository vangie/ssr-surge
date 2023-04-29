# SSR Surge

This is a Surge module that makes Surge to support SSR subscriptions. This module enables the conversion and merging of SSR subscriptions. It should be used in conjunction with the [Sub-Store](https://github.com/sub-store-org/Sub-Store) module. Combined with the Surge configuration file provided by this project, it can solve the problem that the Surge configuration cannot be modified when automatically synchronizing subscriptions and rules.

## Features

- Convert SSR subscription output from Sub-Store to Surge subscription
- Merge multiple Surge subscriptions (SubStore does not support the merging of proxy subscriptions with external proxy format)

## Problems

- The SSR subscription link provided by the network service provider, Surge cannot be used directly
- Surge subscription will lead to configuration lock, which will make it impossible to add custom Proxy/custom rules/MITM certificates, etc.

## Solutions

1. Organize the subscription through the Sub-Store module and filter out the available SSR nodes
2. Use the SSR-Surge module to convert the SSR node subscription organized by Sub-Store into a Surge format subscription
3. [Optional] Merge multiple Surge subscriptions using the SSR-Surge module
4. [Optional] Use conf/unlock-sub.conf to implement subscription synchronization and Surge configuration can be modified

**Pros**
1. Let Surge support SSR subscription
2. Solve the problem that the configuration cannot be modified after the Surge subscription rule
    * Support automatic synchronization of rules and subscriptions
    * Group Proxy by region
    * Support custom Proxy, which can be added manually through Surge UI
    * Support modifying MITM certificate

**Cons**
1. The initial configuration is relatively complicated
2. Need to understand the basic usage of Surge configuration files
3. SSR subscription uses the [External Proxy Provider](https://community.nssurge.com/d/3-external-proxy-provider) mechanism, which will consume a certain amount of memory (about tens of MB).

## Usage

### 1. Install Sub-Store & SSR-Surge & Shadowsocksr-libev

#### 1.1 Install Sub-Store

1. Open [Surge Main Window] -> [Settings] -> [Modules] -> [Install Modules from URL...]. , enter the following link `https://raw.githubusercontent.com/Peng-YM/Sub-Store/master/config/Surge.sgmodule` and enable the Sub-Store module

2. In [Surge Menu] -> [Function] -> check [MitM] and [Script], if you don't do this step, the url https://sub.store will cannot open, which is not mentioned in Sub-Store's documentation, I also found it only after stepping on the pit.


#### 1.2 Install SSR-Surge

1. Open [Surge Main Window] -> [Settings] -> [Modules] -> [Install Modules from URL...]. , enter the following link `https://raw.githubusercontent.com/vangie/ssr-surge/main/conf/ssr.sgmodule` and enable the SSR-Surge module
2. Make sure that [MitM] and [Script] in [Surge Menu] -> [Function] have been checked

#### 1.3 Install Shadowsocksr-libev
The following is the installation method under MacOS, other systems need to search by themselves
```
brew tap vangie/formula
brew install shadowsocksr-libev
```

### 2. Convert and merge Subscriptions

#### 2.1 Preprocessing Subscriptions Using the Sub-Store Module

Open https://sub.store in your browser and configure it. Without deeping into the configuration of the Sub-Store, the following points should be noted:

1. The processed subscription link is in JSON format, and only contains SSR nodes and does not contain other nodes,
2. URL format: `https://sub.store/download/<your-sub> `Do not choose the Surge output format, the Surge subscription result of the Sub-Store output is blank, and the content is as follows:
```json
[
    {
    "type": "ssr",
    "server": "",
    "port": "",
    "protocol": "auth_aes128_md5",
    "cipher": "aes-128-cfb",
    "obfs": "plain",
    "password": "",
    "name": "🇦🇺 AU-Linode",
    "protocol-param": "",
    "obfs-param": "",
    "udp": true,
    "tfo": true,
    "skip-cert-verify": true
    },
    ...
]
```
3. Add the national flag or region name to the subscription name to facilitate subsequent grouping

#### 2.2 Convert and merge subscriptions using the SSR-Surge module

SSR-Surge supports two RESTFul APIs

Convert Subscription：`http://ssr.surge/conv?url=<url>`
Merge Subscription：`http://ssr.surge/merge?url=<url1>&url=<url2>&url=<url3>`

**Tips**
1. The above two URLs can be used in a nested manner, such as converting a subscription first and then merging it
2. <url>, <url1>. Need to do [URL Encoding](https://www.urlencoder.org/)


**Work through an example**

1. Here is an example of the conversion process, assuming you have two subscriptions：
```
## SSR Subscription
https://sub-beta.ohmy.cat/e99fd21

## V2Ray Subscription
https://sub-beta.ohmy.cat/5754846
```

2. The two links above, after a series of modifications and conversions through the Sub-Store, are
```
## SSR Subscription
https://sub.store/download/ssr-sub

## V2Ray Subscription
https://sub.store/download/v2ray-sub
```

3. Convert `https://sub.store/download/ssr-sub` subscriptions via SSR-Surge
```
https://ssr.surge?conv?url=https%3A%2F%2Fsub.store%2Fdownload%2Fssr-sub
```

4. Merge `https://ssr.surge?conv?url=https%3A%2F%2Fsub.store%2Fdownload%2Fssr-sub` and `https://sub.store/download/v2ray-sub` subscriptions via SSR-Surge
, the final subscription link is as follows
```
https://ssr.surge?merge?url=https%3A%2F%2Fssr.surge%3Fconv%3Furl%3Dhttps%253A%252F%252Fsub.store%252Fdownload%252Fssr-sub&url=https%3A%2F%2Fsub.store%2Fdownload%2Fv2ray-sub
```

### 3. Config Surge

1. Download and edit the [conf/unlock-sub.conf](./conf/unlock-sub.conf) file, the `<your-sub-url> `Replace with the subscription address obtained above, and then put the conf/unlock-sub.conf file in Surge's configuration folder `$(HOME)/Library/Application Support/Surge/Profiles`, and switch the Surge configuration to use unlock-sub.conf.
2. In order to simplify the configuration, the conf/unlock-sub.conf file has a built-in MitM certificate. Considering security, it is also recommended to regenerate a certificate by yourself.


## Contributing
If you want to contribute to SSR-Surge, please take a look at following contributing guide.

### Setup

Initialize development environment

```bash
make setup
```

### Build

Build the source code to the `dist` directory

```bash
make all
```

### Local Test

Install to the local Surge Profiles directory for easy local debugging

```bash
make install
```

## License
SSR-Surge is fully [MIT licensed](LICENSE).