# JR East Zairai LCD PIDS

JR East LCD-style passenger information displays for **Minecraft Transit Railway 4** and **Joban Client Mod**.

**[Download the playable resource pack on Modrinth](https://modrinth.com/project/jreast_zairai_lcd_pids)** · **[User guide / 使用说明](User_Guide.md)** · **[Report a problem / 问题反馈](https://github.com/ShiKong2005/JREAST_zairai_lcd_pids/issues)**

## English

This repository publishes the **v1.4 source scripts and configuration** by **Shi_Kong233**. It includes the timetable renderer, route-data handling, rounded housing, ATOS scheduling, preset registration, and sound-reference/timing manifests.

- Displays platform numbers, route/destination information, departure times, service types, and conditional car counts.
- Supports bilingual pages, English-only data, approaching/end-of-service messages, and scrolling notices.
- Provides west&north and east&south layouts with male/female announcement presets.
- Supports the rounded LCD housing and original JCM PIDS 1A housing.
- Preserves configured service wording; recognized grade identities drive colours and announcements separately.

The scripts target Minecraft 1.20.1, MTR 4.0.5 and JCM 2.2.5. Source files were compared byte-for-byte with the current v1.4 public resource pack on 2026-11-08. Release SHA-256:

```text
9bab3c5a0d3ba11e732f0e8fe7cd82d3f70e2fd0e7ba29351b1c7da5efb0a9a0
```

This repository is a source snapshot. **GitHub's “Download ZIP” is not a complete playable resource pack.** Font binaries, recordings, and the in-game screenshot icon are not included. The JSON manifests reference those external release assets. Obtain the complete playable package from Modrinth; when working on scripts, preserve the asset paths and preset IDs used by that release.

File roles:

| File | Purpose |
|---|---|
| `assets/jsblock/scripts/network.js` | Network snapshots, route metadata and vehicle information |
| `assets/jsblock/scripts/yamanote.js` | Service parsing, layout, display states and scheduling |
| `assets/jsblock/scripts/raster.js` | Java2D drawing, glyph caches and texture updates |
| `assets/jsblock/scripts/housing.js` | LCD housing integration |
| `assets/jsblock/scripts/atos.js` | Announcement selection and timeline handling |
| `assets/jsblock/joban_custom_resources.json` | Four display presets and script load order |
| `assets/yamanote/*.json` | Sound registration and announcement timing references |

## 中文

本仓库公开 **Shi_Kong233** 制作的 **v1.4 源码和配置**，包括时刻表绘制、线路数据读取、圆角外壳、ATOS 调度、预设注册，以及声音引用和时间配置。

- 显示站台号、线路和目的地、发车时间、列车种别及符合条件时的编组数量。
- 支持双语页面、纯英文数据、接近／运营结束提示及滚动公告。
- 提供 west&north、east&south 两种方向与男／女声组合的四个预设。
- 支持圆角 LCD 外壳和 JCM 原装 PIDS 1A 外壳。
- 等级正文保留配置原文，配色和播报独立按等级身份识别。

源码目标环境为 Minecraft 1.20.1、MTR 4.0.5、JCM 2.2.5。2026-11-08 已与当前 v1.4 公开成品逐字节核对脚本和配置，完整成品的 SHA-256 见上文。

**GitHub 的“Download ZIP”是源码快照，不能直接作为完整资源包启用。** 本仓库未包含字体二进制、录音和游戏截图图标，声音 JSON 引用的实际素材也不在仓库中。玩家请从上方 Modrinth 链接下载完整成品。修改脚本时应沿用对应成品的资源路径与预设 ID。

## License / 许可证

Copyright (c) 2026 Shi_Kong233.

The project-authored source and documentation in this repository are licensed under **[CC BY-NC 4.0](https://creativecommons.org/licenses/by-nc/4.0/)**; the full standard text is in [LICENSE](LICENSE). Attribution, license notices and modification notices must be retained as required. Commercial uses require separate permission unless otherwise permitted by applicable law. No server-exclusive or blanket no-redistribution conditions are added.

本仓库由本项目创作的源码和说明采用 **[CC BY-NC 4.0（署名—非商业性使用）](https://creativecommons.org/licenses/by-nc/4.0/deed.zh-hans)**，标准完整正文见 [LICENSE](LICENSE)。请按许可保留署名、许可信息及修改说明；除法律另有允许外，商业性使用须另行取得许可。不附加服务器专用或全面禁止转载的限制。

The code license does not grant rights to third-party recordings, font software, game artwork or APIs. Those materials retain their respective rights and licenses; binary assets are not distributed here. Reference font software in the playable release retains its embedded SIL OFL and copyright metadata.

代码许可不授予第三方录音、字体软件、游戏美术或接口的权利，这些内容保留各自的权利与许可证；本仓库不分发这些二进制素材。成品中的相关字体保留内嵌 SIL OFL 正文及版权元数据。
