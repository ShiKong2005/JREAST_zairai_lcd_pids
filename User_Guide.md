# jre_zairai_lcd_pids 使用说明 / User Guide

[中文](#中文) · [English](#english)

适用资源包：**v1.4**  
作者：**Shi_Kong233**  
更新日期：2026-11-08

本资源包免费公开提供。字体所需的署名和完整 OFL 文本保存在各字体的元数据中。

This resource pack is publicly available free of charge. Font attribution and the complete OFL text are included in each font file's metadata.

这是一个供 Minecraft MTR / JCM 使用的 JR 东日本在来线 LCD 风格站台信息屏资源包。安装后，可以显示站台号、线路及方面、最近两班的出发时刻、列车等级、目的地和符合条件的编组数量。

## 同包双外壳 / Two housings in one pack

启用当前 v1.4 资源包后，继续使用原有的四个方向／声线预设。JCM 2.2.5 的 `jsblock:lcd_pids` 自动绘制圆角壳和内嵌屏幕，壳体约宽 3.37 格、高 0.96 格，请预留净空。`jsblock:pids_1a` 保留 JCM 原装外壳及显示面位置，两面仍各自读取所在方块的数据和预设。两款共用时刻表、等级、配色、公告及 ATOS，单线路两班普通快速均采用三段等距留白，后续显示更新也同时适用于两款。请只启用这一个 PIDS ZIP，旧版使用相同的预设 ID。

Enable the v1.4 pack and keep using the four existing orientation/voice presets. On JCM 2.2.5, `jsblock:lcd_pids` automatically uses the rounded casing and recessed LCD. Allow clearance for the casing, which is about 3.37 blocks wide and 0.96 blocks tall. `jsblock:pids_1a` keeps its original JCM housing and screen positions; each face still uses its own block data and preset. Both types share the timetable, grade styling, colours, notices and ATOS, including three equal gaps around two ordinary Rapid badges on a single route. Future display updates apply to both types. Enable only this PIDS ZIP, since older editions use the same preset IDs.

## 中文

### 1. west&north / east&south 怎么选

游戏内有四个预设，先选方位，再选声线：

- `JREAST_zairai_lcd_pids v1.4 (west&north / 男声 / Male)`
- `JREAST_zairai_lcd_pids v1.4 (east&south / 男声 / Male)`
- `JREAST_zairai_lcd_pids v1.4 (west&north / 女声 / Female)`
- `JREAST_zairai_lcd_pids v1.4 (east&south / 女声 / Female)`

按组成显示屏的方块在世界中的排列方向选择：

| 显示屏排列方向 | west&north：站台号所在端 | east&south：站台号所在端 |
|---|---|---|
| 南北排列 | 北端 | 南端 |
| 东西排列 | 西端 | 东端 |

预设名称表示世界方位，不是玩家当前视角的左右。双面屏的站台号应位于同一个物理端；绕到背面后，文字仍正常阅读，信息区内的列顺序不变。可用 F3 查看方位。

原 left 对应 west&north，原 right 对应 east&south。原有两个 ID 保留为男声，因此已有屏幕保持男声及绑定；需要女声时选择对应的新预设。

以上规则针对水平摆放的方块显示屏；投影器额外手动旋转后的布局不在此规则内。

**单线路与双线路采用不同结构。** 单线路的两班信息只显示“等级＋时刻＋目的地”，不在每行重复线路名；等级恢复原来的较大色块和字号。双线路才在每行显示“线路名＋等级”，并保持已确认的大小、位置和下沿对齐。最多显示两条线路，外壳与四预设不变。

单线路顶栏保留编号、线路名和方面三个区。线路名在左，方面独立向右排列，两者的栏目边界固定留约 15.1 逻辑单位（1600宽预览约60px）。括号说明及较长英文线路名可分两行，长方面按余下栏宽适配，不能侵入线路名。双线路顶栏位置不变。

班次区恢复网站改版前的排版：单线路等级占据左栏主要高度，时刻、站点编号／目的地及両数紧接其后，去掉此前小等级牌右侧的大空段。两班均为普通快速时继续采用三段等距留白。双线路的等级底色仍至分隔线／屏底，文字仍按可见下沿对齐。顶栏深底、灰色分隔线和现有等级颜色保留。

等级名按线路代号中填写的正文显示，配色与播报识别另行处理。中央／青梅／通勤特快英文在单、双线路均固定两行左对齐；特急、通勤快速和 Special Rapid 沿用单行适配。连写英文不插入空格，字体保持自然比例。

两班普通目的地仍共同适配字号；公告和接近提示临时覆盖下行时保留上行参照。无等级、终到、隐藏、自订信息及播报行为沿用，终到提示左对齐。信息区保留外壳窄缝。

### 2. 线路与目的地怎么填写

名称使用英文半角符号 `|` 和 `||`。单个 `|` 分隔两种语言，双竖线 `||` 用于后面的编号信息。

#### 线路名称

在线路名称栏填写：

```text
南海线|Nankai Line
```

第一段可以是中文或日文，第二段填写英文。资源包不会自动翻译；没有第二语言时，英文页会继续显示第一段。

需要区分上下行时，可以这样命名：

```text
南海线|Nankai Line||上行
南海线|Nankai Line||下行
```

顶部会把第一语言名称完全相同的线路合并展示。`南海线` 与 `南海线支线` 不会合并；名称中间多出的空格也可能使它们被视为不同线路。

#### 线路号码与列车等级

以下内容填写在 MTR 的**线路号码**栏，三种格式任选一种：

```text
各停|Local||RA
RA [各停]|RA [Local]
RA 各停|RA Local
```

以上写法都表示线路代号 `RA`、第一语言等级 `各停`、英文等级 `Local`。英文等级可以包含空格，例如：

```text
特急|Limited Express||RA
RA [特急]|RA [Limited Express]
RA 特急|RA Limited Express
```

后两种格式的两段代号应一致。不要写成 `RA 各停|RB Local`。

若不需要线路代号，可以只填写已识别的等级，例如 `快速|Rapid`、`普通|Local`、`特急|Limited Express`，也支持只填 `Rapid` 或 `Limited Express`。此时顶部不显示编号框，班次行按等级显示文字和背景色。未列入颜色表的自定义等级可以使用 `区間快速|Semi Rapid||`，末尾的 `||` 明确表示代号留空。

等级正文按输入原样显示。填写 `普通`，两种语言页面均显示 `普通`，不会自动补为 Local；填写 `普通|Local` 时才分别显示这两段。只填代号（例如 `RA`）或未填等级时：单线路仍显示黄色先発／次発，双线路使用放大的线路名称并靠左显示，不补等级底色。

没有填写线路号码或未提供线路代号时，顶部不显示方形编号框，也不显示占位横线；线路名称利用空出的空间。双线路分别判断，已填写号码的线路仍正常显示编号框。

#### 目的地站号

目的地名称可以附加站号：

```text
桥本|Hashimoto||NK04
```

当该班次线路代号是 `NK` 时，目的地旁会显示 `NK / 04` 编号框。共享目的地可写多个编号：

```text
桥本|Hashimoto||JK01NK04
```

- `JK` 班次显示 `JK01`。
- `NK` 班次显示 `NK04`。
- 其他代号的班次不显示该编号框。

**线路代号必须与站号的字母前缀完全一致，并区分大小写。** 例如 `K` 不匹配 `NK04`，`nk` 也不匹配 `NK04`。站号使用“英文字母＋数字”，数字前面的零会保留。

班次自带的目的地编号优先使用。若缺少当前线路的编号，会在该班次实际线路从本站起的停靠站中，按任一语言名称完全一致查找目的地，并读取当前车站名称中的编号。例如旧班次仍带 `NK04`，而桥本站名已改为 `桥本|Hashimoto||NK04JC04`，JC 班次可补全 `JC04`。不同车站重名、线路不明、无匹配编号或原编号格式有误时不猜测，隐藏编号框，目的地文字仍显示。手动设置 `rowDestination` 时使用手动内容，不自动补编号。顶部线路编号不受影响。填写这些编号不会替你设置 MTR 的实际站台号或停靠关系。

### 仅填写 JC 或使用纯英文

线路号码只写 `JC` 也能正常显示线路编号，并匹配目的地中的 `JC04`，不要求填写等级。纯英文可直接使用：

```text
线路名称：Chuo Line
线路号码：JC
目的地名称：Hashimoto||NK04JC04
```

需要英文等级时，线路号码可写 `Rapid||JC`、`JC Rapid` 或 `JC [Rapid]`；多词等级支持 `Limited Express||JC`、`JC Limited Express`、`JC [Limited Express]`。只写 `Rapid` 表示只有等级、没有线路代号，因此不会推测出 JC 编号。

名称、方面站名和等级均使用纯英文时，默认自动固定英文页，使用 `for`、`Cars`、`Not in service` 等英文提示，不再每八秒切换日文。无等级且只有一条线路时，顺序标签显示 `First / Next`；双线路仍显示放大的线路名。有中文／日文内容时保留原双语轮换。手动配置 `language` 为 `ja` 或 `en` 时，以该设置为准。

### 3. 等级背景色

等级底色只按完整等级名称匹配，同一等级在所有列车、两种外壳及各语言页上用同一颜色。已移除为了配色而逐节读取车型 ID 的操作；両数和 ATOS 继续按实际班次工作。此规则仅适用于站台 PIDS，车辆资源包不受影响。

| 等级 / Service | 背景色 / Background |
|---|---|
| 各停／各站停车／各駅停車／普通 / Local | `#333333` |
| 快速 / Rapid | `#DC3039` |
| 急行 / Express | `#DC3039` |
| 特急 / Limited Express / Ltd.Exp. | `#FF2929` |
| 特别快速 / Special Rapid | `#0074BF` |
| 通勤快速 / Commuter Rapid | `#C000C0` |
| 中央特快 / Chuo Special Rapid | `#0055BF` |
| 青梅特快 / Ome Special Rapid | `#00C52B` |
| 通勤特快 / Commuter Special Rapid | `#FF0080` |
| 未知自定义等级 / Unknown custom grade | `#252A32` |
| 未填写等级 / No grade | 无色块 / No badge |

建议同一班次的两种语言填写含义对应的等级，以免配色与文字含义不一致。

等级显示与识别分开：显示使用线路代号中填写的等级正文，`|` 区分语言、`||` 引入线路代码，不把格式分隔符画在屏幕上。不自动缩写、展开名称、翻译、改大小写或给连写英文补空格。只填一种语言，两页均沿用该原文。配色和 ATOS 仍识别已知等级，识别忽略大小写和空白；`Ltd.Exp.`、`ltd. exp.`、`LimitedExpress` 和 `Limited Express` 均为特急，底色同为 #FF2929，画面仍各自保留所填写法。

例如填写 `Limited Express` 就显示完整名称，填写 `Ltd.Exp.` 就显示该缩写；`CommuterRapid` 不会补成 Commuter Rapid，`Chūō Special Rapid` 不会去掉重音符号。三种 S.R. 显示替换已取消。

| 等级 | 单线路英文显示 | 双线路英文显示 |
|---|---|---|
| 各駅停車／各停／普通 | Local | Local |
| 快速 | Rapid | Rapid |
| 急行 | Express | Express |
| 特急 | Limited Express | Limited Express |
| 特快／特別快速／特别快速 | Special Rapid | Special Rapid（放大单行） |
| 通勤快速 | Commuter Rapid（居中单行） | Commuter Rapid（单行居中） |
| 中央特快 | Chuo ↵ Special Rapid（左对齐） | Chuo ↵ Special Rapid（左对齐） |
| 青梅特快 | Ome ↵ Special Rapid（左对齐） | Ome ↵ Special Rapid（左对齐） |
| 通勤特快 | Commuter ↵ Special Rapid（左对齐） | Commuter ↵ Special Rapid（左对齐） |

分行仅用于适配已有等级区域，不替换文字。中央／青梅／通勤特快英文在单、双线路均固定两行左对齐，上行为 Chuo／Ome／Commuter，下行为原文 Special Rapid；特急、通勤快速沿用单行。三种特快连写输入在原有前缀后换行，不额外补空格；其他连写输入保持整串适配。两行共用字号和自然比例，其他位置、底色和行距保持。

绘制器按实际字形测宽并使用各自等级栏的边界。长文本自然缩小，不拉伸字母；单线路保留原较大等级牌，双线路保留已确认的等级栏位置与填满范围。

自定义等级保留原文与大小写；双线路默认单行居中并按可用宽高自然适配，单线路按原有字宽规则选择一／两行。未知等级使用中性深色，空等级不会自动补成 Local。名称识别仅用于配色和播报，不反向修改显示。

### 4. 屏幕会显示什么

#### 顶部线路与方面

顶部读取绑定站台停靠的线路，合并同名上下行后最多显示 **两条**。两条并排，不显示第三栏、不分页；超过两条时沿用第一语言名称排序取前两条。班次列表和両数判断仍使用原有数据。

每条线路的方面最多显示 **三个站名，包含目的地**。中途站只从本站之后实际停靠的站点中选取：优先选可换乘其他线路的站点，剩余位置再从普通停靠站中分散选取。列车跳过的站不会插入方面栏。最终按行驶顺序排列，目的地放在最后。

顶部线路名称为白色。双线路情况下，下面班次行的线路名称使用各自线路颜色。长名称会自动缩小以适应显示区域。

双线路的班次左侧栏中，线路名居中使用整栏宽度，下方等级背景略小一圈；等级文字保持现有字号和位置。时间与目的地列保持原位置。

#### 两班信息与时间

正常情况下显示游戏提供的最近两班，底部不再轮换在线位置图。

默认显示**出发时间＝到站时间＋停站时间**，使用 `HH:mm` 格式，按客户端系统时区显示，不使用 Minecraft 日夜时间。开门时不会把时间替换为“停车中”。

除纯英文自动固定显示外，两种语言每 **8 秒**切换一次：第一语言 8 秒、英文 8 秒，完整一轮 16 秒。第一语言由你填写的中文或日文决定，不是中、日、英三页轮换。班次数据每 **1 秒**刷新。

#### 列车接近提示

第一班距离预计到站**大于 5 秒且不超过 50 秒**时，第二行可显示黄色接近提示，每 0.5 秒切换亮灭；第一班信息保留。第二班是本站终到时，也不再阻止第一班的接近提示。

距预计到站剩余 5 秒或更少时，提示结束，恢复第二班信息。如果已经识别到该班列车停稳并开门，也会提前结束提示。车辆同步和数据刷新可能带来短暂延迟。

本包不显示停车中、关门提醒或在线列车位置图。

#### 列车接近提示音

接近提示首次亮起时，播放一次提供的 ATOS 提示音，不随 0.5 秒闪烁重复播放。**同一客户端内，同一实际站台的同一班列车只播放一段放送**；其余屏幕继续显示接近信息，但不重复播放，四个方位／声线预设混用也会去重。晚加载或重新创建的屏幕会按下述统一时间轴判断是否接入；已有当前放送时共用同一播放进度，不重新开始。不同实际站台独立处理，不根据显示的站台号码或名称合并。

相同班次因 ETA 波动重新进入提示窗口，或计划时间发生 1 秒以内的小幅修正，都不重播。停稳开门记录也会保留，避免进站时又从头播放。已经开始的提示音及人声会自然播完，不因 ETA 波动、临时缺失班次、提示取消、隐藏或普通自订信息顶替而截断。播放期间由独立任务维护声音：最初触发的屏幕不再渲染或所在区块卸载时，仍可通过附近其他 PIDS 继续听到当前进度；重新加载的屏幕不会从头补播。离开世界时停止并释放任务，正常播完后也自动释放。班次切换时，同一站台的新提示音等待前一条完整放送（包含両数）结束并预留 0.5 秒后再播放；只有原提示音时仍至少等待 4 秒，避免重叠。

原提示音约 3.35 秒，已转换为适合定位播放的单声道 OGG，平均电平比原始单声道混音提高约 6.14 dB，比上一版再提高约 1.95 dB；响度约 -12.18 LUFS，输出真峰值约 -1.02 dBTP，无削波。原 MP3 文件未改。

**每块 PIDS 的控制方块中心都是一个半径 50 格的球心，距离包含上下高度。** 同一站台的一段放送始终选取离玩家最近的已加载 PIDS，以它为声源，采用原生线性衰减。例如先站在 A 屏旁 5 格，再走到 B 屏旁 5 格，两处采用相同的距离衰减和音量设置；不会一直按 A 屏计算。离所有相关 PIDS 都达到或超过 50 格时静音，走回任一球内则继续听到当前播放进度，不从头重播。没有已加载的相关 PIDS 时也静音。両数尾句沿用这套规则；声音不叠加，不因正反面重复播放。受游戏“方块音效”和主音量设置影响，球的边界附近音量趋近于零。

#### 按到站倒计时接入放送

整段放送使用固定时间轴：**到站前 50 秒为第 0 秒，当前进度＝50 秒－剩余到站时间**。及时进入窗口的首个轮询／闪烁周期（不足 1 秒）继续使用原有完整录音；更晚加载时，从对应公共语句的约 1 秒断点接入，然后顺序完成后续语句与両数。声音播放中继续使用既有进度，ETA 小幅修正不反复跳转。

例如整段长 20 秒，剩余 40 秒加载时从约第 10 秒接入；剩余 30 秒时整段已结束，剩余 20 秒时也不播放。实际截止按该等级主句、自然间隔和实际両数尾句的总时长判断，不把所有放送写死为 20 秒。过期后接近文字仍按原规则显示至剩余 5 秒，音频不补播。

中途接入复用开场、番线、等级与到达句、安全提示等公共音频，正常整句录音保留。只为短句本身准备秒断点，避免为每个番线和等级重复保存整个后半段。各段电平按原完整录音校准，采用原调、单声道、24 kHz，继续使用最近 PIDS 的 50 格球形范围。切换语句前检查上一段原生播放已完成，避免重叠。

服务器环境使用 MTR 已校正客户端与服务器时差的到站数据；每位玩家须加载同一新版资源包，按各自收到的班次时间接入。网络、数据刷新和音频提交可能带来短暂偏差，不保证采样级同步。资源重载等情况若丢失原声音实例，仍在时间轴内时可从当前断点恢复；活动实例的共享租约阻止同站台其他屏幕重复创建，已完成的同班次保留去重标记。

#### ATOS 男声／女声接近放送

男声预设使用津田原声，女声预设使用向山原声。各声线的开头、1～15番线、等级、到达句、安全提示和両数均来自对应声线，不混用男女片段，不降调、不做变声。保留原语调与语速，统一响度；可可靠取得噪声样本的片段进行轻度底噪抑制。非人声接近提示音由两种声线共用。

同一实际站台、同一班列车继续只播放一次，由最先触发的预设确定这次放送的声线；其他屏幕提供最近声源位置，不叠加另一种声线。建议同一站台使用同一声线，便于确定播报效果。两种声线都支持相同的等级、両数、50→5秒接近窗口、半径50格覆盖及约1秒断点接入。

两套音频采用 **24 kHz、单声道、Vorbis q3** 适度压缩，取消公共断点片段的强制预加载，改为需要时解码。相同时长的16位解码PCM约为原48 kHz的一半；降低OGG码率本身主要减少包体，不能单独保证游戏内存按同比例下降。正常完整录音仍可播放，母版及来源记录保存在开发工作区。实际峰值内存取决于已使用的音频及游戏缓存，需游戏测量。

男声录音已逐片段处理持续的沙沙声、嘶声，尽量保留人声细节；处理前后片段时长一致。旧录音中与人声重叠的噪声和有损压缩残留可能仍有少量保留，实际效果可先试听。

站台号按**完整原文精确匹配**当前声线的录音表。目前只有完全写为 `1`～`15` 的半角编号能使用相应番线语音。不会转换全角、去除空格／前导零、截取语言段、解析数值或删除 `番線` 等后缀。因此 `01`、`１`、`1番線`、` 1`、`1 `、`1|01` 都不等于 `1`，不会借用其录音；没有完全匹配的素材时只播放提示音。手动 `platform` 也按完整原文匹配；仅未设置或空字符串时使用班次原始站台号。男女声、首次播放和中途接续采用相同规则。

指定等级的放送内容为：

`まもなく、1番線に、普通、参ります。危ないですから黄色い線までお下がり下さい。この列車は、8両です。`

其中番线随班次改变；等级支持 **各駅停車（各停）、普通、快速、特別快速、中央特快、青梅特快、通勤特快、通勤快速、急行、特急**。现有简繁中文和英文已知别名也能识别；`普通|Local` 播「普通」，仅填英文 `Local` 播「各駅停車」。`特快` 对应「特別快速」。

其他等级、空等级，以及本次未指定的快速アーバン／快速ラビット／快速アクティー，使用通用放送：

`まもなく、1番線に、列車が参ります。危ないですから黄色い線までお下がり下さい。この列車は、8両です。`

両数读取该班列车的实际 `carCount`，不按车型猜测，也不受屏幕是否显示両数影响。原声支持 **1～12、14、15 両**；车厢数缺失、非整数或没有对应声线素材（例如 13 両）时，省略最后的両数句，其余放送照常。

主放送含提示音约 15～18 秒，仍为一条完整录音；安全提示结束后留自然停顿，再接一条完整的「この列車は、N両です」，追加约 3～5.5 秒。主录音尚在原生播放时会等待，不让两句重叠；追加両数纳入同站台共享保留期。班次文字按 50 秒开始、剩余 5 秒取消；已经开始的人声及両数继续播完。同站台多屏、左右预设混用及晚加载屏幕沿用同一班次去重。

#### 本站终到

当班次目的地与站台所属车站的第一语言名称完全一致时，该班次行只显示红色：

- 第一语言页：`当駅止まり`
- 英文页：`Not in service`

该行原有的时刻、等级、编号和编组不再显示，提示文字与目的地区域对齐。判断时忽略英文部分和编号信息，但不做相似名称匹配。

该线路的顶部方面也会留空，保留线路名和编号；其他线路正常显示。两班分别判断：第一班本站终到时不触发其接近提示；第一班正常接近时，第二行的终到文字可被接近提示临时顶替，剩余 5 秒时恢复。

#### 编组数量

车辆数量的数字及“両 / Cars”单位均采用较小字号，保持在右侧区域居中。

屏幕会比较当前收到的所有班次，包括第三班及以后：

| 当前班次编组示例 | 显示结果 |
|---|---|
| 8、8、8 | 隐藏编组数量 |
| 8、8、12 | 前两班均显示 `8 両 / 8 Cars` |
| 有数量未知的班次 | 未知值不作为编组不同的依据，也不凭空显示数量 |

这里的“所有班次”指游戏当前提供给这块屏幕的班次，不是尚未同步的全天时刻表。

#### 消息、隐藏行与无车提示

支持 JCM 的前两行普通自定义消息、隐藏行和隐藏站台号。无格式消息继续常驻替代对应班次行；普通自定义消息和隐藏设置优先，任一行有普通消息或被隐藏时，不显示自动接近提示。带 `@notice` 格式的公告不按常驻消息处理，可填在任意自订信息栏，包括第三栏。

#### お知らせ滚动公告

在 JCM 设置的任意一个“自订信息”栏填入（建议优先使用第三栏），不必勾选“隐藏到达班次”：

```text
@notice #FFFF00 因线路检查，部分列车晚点，请留意站台广播。
```

`@notice` 是公告前缀，后面用空格隔开；`#RRGGBB` 或 `#RGB` 设置文字颜色，省略颜色时默认为黄色。可以在同一条公告中用 `{#HEX}` 切换后续文字颜色：

```text
@notice #FF0000 【運行情報】{#FFFF00}線路内点検の影響で、一部列車に遅れがでています。
```

- 首次识别首班或首班列车更换后，正常班次从完整的第一语言页（中文／日文）开始；第一语言→英文为一轮，完整显示两轮后，下方一行临时穿插一条公告。默认每页8秒，两轮共32秒；修改 `languageSeconds` 后按新间隔重新累计。固定第一语言、固定英文及全英文自动固定页面时，按同样的四页等效时长插播。仅下一班变化或正常 ETA／延误刷新不重置首班计数。
- 读取前三个自订信息栏，按第一栏→第二栏→第三栏的顺序轮流播放，自动跳过没有滚动公告的栏位；每次插入只播放一栏。该条向左滚动一遍，全部移出中间窗口后恢复第二班，再正常显示完整两轮后播放下一栏，最后回到第一条。首班更换保留公告队列位置；若当时正在滚动，先恢复新班次，未播完的该条在两轮后从头播放。第一班、顶部线路和站台号一直保留。文字横穿中央窗口约5秒，整条播完时间取决于正文长度。
- 左右红色渐变固定，铺满内侧第二行高度，外缘到达内侧显示边界，与外壳之间保留统一窄黑缝；渐变内侧与中间文字窗口之间各留一段纯黑间隔。文字垂直居中，只在中间窗口内滚动，不进入渐变或黑色间隔区域。
- 列车接近提示优先于滚动公告；接近提示，以及下方行被隐藏或由普通常驻消息占用的时间，不计入正常班次轮次。高优先级显示结束后，重新正常显示完整两轮再播放公告，不从半截继续。第二行有普通常驻消息或被隐藏时不穿插公告。没有有效班次时仍保留原无车提示。
- 公告正文按原文显示，不自动翻译；`|` 在公告内作为普通字符。无 `@notice` 前缀、格式错误或空公告沿用原普通自订信息行为。删除公告后，在下一次数据刷新时恢复原显示。
- 公告滚动最多每秒更新 20 次，班次每秒读取。共用线路索引在数据集或条目数量变化时立即刷新，已有线路或站名的编辑最多约 5 秒反映到屏幕。

没有班次或第一班距离到站超过默认 120 分钟时，会显示运营结束提示：第一语言页为 `☆本日の運転は終了しました☆`，英文页为 `Service has ended for today`。下方不再显示时刻表提醒。若你认为应当有车，请先检查线路、运行计划和站台绑定。

### 5. 常见问题

| 问题 | 建议检查 |
|---|---|
| 找不到本包预设 | 确认已安装 JCM、资源包在当前实例中且已启用，然后按 F3＋T。旧版预设需改选当前 west&north / east&south。 |
| 更新后仍是旧画面 | 停用旧版同名资源包，确认替换的是当前实例的 ZIP，再按 F3＋T。 |
| 显示屏黑屏 | 检查模组版本、资源包是否完整及是否有重复旧包；重新选择本包预设。仍异常时，反馈截图与本次游戏的 `logs/latest.log`。 |
| 有车却没有班次信息 | 确认显示屏绑定的是该列车实际停靠的站台，并检查 MTR 线路和运行计划。仅在附近有列车并不代表它停靠当前站台。 |
| 站台号在另一侧 | 根据世界中的南北／东西方向对照预设表，不以当前视角判断。 |
| 目的地没有编号框 | 检查 `||`、字母前缀、大小写和数字，例如线路 `NK` 对应目的地 `NK04`。 |
| 顶部少了一条线路 | 检查是否被同名合并，以及合并后是否超过两条上限。顶部线路不只取最近两班。 |
| 等级没有对应颜色 | 检查名称是否完整匹配上表，例如 `区間快速` 不按 `快速` 匹配。 |
| 英文页仍显示中文／日文 | 名称可能没有填写 `|英文` 部分；资源包不会自动翻译。 |
| 没有编组数量 | 所有已知编组相同或数量未知时会隐藏，这是正常行为。 |
| 出现红色终到提示 | 检查班次目的地是否与本站第一语言名称相同。 |
| 个别字缺失 | 当前字体经过裁剪，部分罕见扩展汉字可能不包含，可先换用常用字确认。 |

### 6. 可选：调整语言和清晰度

默认设置即可使用。需要修改时，编辑资源包内：

```text
assets/jsblock/joban_custom_resources.json
```

找到对应预设的 `scriptTexts`，修改已有的 `YAMANOTE_OPTIONS`。例如，west&north 预设改为每 10 秒切换语言：

```json
"scriptTexts": ["var YAMANOTE_OPTIONS = { platformSide: 'left', language: 'cycle', languageSeconds: 10 };"]
```

`platformSide` 是内部配置值，west&north 仍使用 `left`，east&south 仍使用 `right`。

这是预设中的一个字段，不是完整文件。保留文件其他内容；east&south 预设保留 `platformSide: 'right'`。需要调整的方位／声线预设须分别修改。保存回资源包后按 F3＋T；后续替换新版 ZIP 时，个人修改需要重新应用。

| 选项 | 默认值 | 用途 |
|---|---|---|
| `language` | `'cycle'` | `'cycle'` 双语轮换，纯英文数据自动固定英文；`'ja'` 固定第一语言（中文或日文）；`'en'` 固定英文 |
| `languageSeconds` | `8` | 每一页显示秒数，仅在双语轮换时生效，最少 1 秒 |
| `timeSource` | `'departure'` | `'departure'` 出发时刻；`'arrival'` 到站时刻 |
| `textureWidth` | `1024` | 显示清晰度；支持 512–1600，实际宽度调整为 4 的倍数，高度为宽度的四分之一 |

默认清晰度为 1024×256。更高分辨率会增加图像处理和显存开销，建议先保持默认。资源包压缩体积与游戏内实际帧率不是同一个指标。

画面会在内容变化或动画更新时重绘；公告滚动、接近提示闪烁等局部变化只重绘并上传涉及的像素区域，仍共用一张双面显示纹理。班次保持每1秒采集，公告保持50毫秒步进、接近提示保持500毫秒闪烁。ATOS播放期间仍由独立任务维护最近声源和语句接续，空闲屏幕会跳过不必要的声音同步检查。

---

## English

Resource pack version: **v1.4**  
Author: **Shi_Kong233**  
Last updated: 2026-11-08

This resource pack provides JR East conventional-line LCD-style platform displays for Minecraft MTR / JCM. It shows the platform number, lines and directions, departure times for the next two services, service types, destinations, and car counts when applicable.

### 1. Choosing west&north / east&south

There are four presets; select the orientation and voice:

- `JREAST_zairai_lcd_pids v1.4 (west&north / 男声 / Male)`
- `JREAST_zairai_lcd_pids v1.4 (east&south / 男声 / Male)`
- `JREAST_zairai_lcd_pids v1.4 (west&north / 女声 / Female)`
- `JREAST_zairai_lcd_pids v1.4 (east&south / 女声 / Female)`

Choose according to the direction in which the display blocks are arranged in the world:

| Display alignment | Platform-number end with west&north | Platform-number end with east&south |
|---|---|---|
| North–south | North end | South end |
| East–west | West end | East end |

Preset names refer to world directions, not the player's current viewpoint. On a double-sided display, the platform number should stay at the same physical end. Text remains readable from the back, and the column order within the information area stays the same. Use F3 to check directions.

The former left/right IDs remain the male west&north/east&south presets, preserving existing bindings and voice selection. Choose a new female preset to use the female voice.

These rules apply to horizontally arranged block displays. Additional manual rotation of a projector is outside this placement rule.

**Single- and two-route boards use different row structures.** A single-route row shows only service grade, clock and destination, with the original larger service badge and font. It does not repeat the line name above the grade. Two-route rows retain the approved line-name-plus-grade layout, sizes, positions and lower-edge alignment. At most two lines are displayed; both housings and all four presets remain.

The single-route header has separate code, line-name and direction areas. The direction moves right, leaving about 15.1 logical units between the label boxes (about 60px at 1600 width). Parenthetical qualifiers and longer English line names can wrap into two lines. Long directions fit the remaining width without entering the line-name area. Two-route header placement is unchanged.

Timetable rows use their pre-redesign layout. Single-route grades fill most of the left column height, followed by the clock, station code/destination and car count. The compact badge and large blank interval are removed. Two ordinary Rapid badges on a single-route board retain three equal gaps. Two-route grade backgrounds still reach the divider/bottom edge, with the approved visible lower-edge text alignment. Current header/rule/grade colors remain.

Service labels use the entered wording independently of recognition for colors and audio. Chuo/Ome/Commuter Special Rapid names use two left-aligned lines in both single- and two-route layouts. Limited Express, Commuter Rapid and Special Rapid retain single-line fitting. Compact input is never given extra spaces.

The two normal destinations retain shared font fitting. Temporary notices and approach overlays preserve the first row's size reference. Missing grades, terminating services, hidden/custom rows and audio behavior remain, with terminating messages left-aligned and narrow housing gaps retained.

### 2. Entering line and destination information

Use the ASCII characters `|` and `||`. A single `|` separates the two languages; `||` introduces the code information that follows it.

#### Line name

Enter the following in the line-name field:

```text
南海线|Nankai Line
```

The first part can be Chinese or Japanese, and the second part is English. The pack does not translate names automatically. If the second language is missing, the English page continues to show the first part.

To distinguish opposite directions, you can name the routes as follows:

```text
南海线|Nankai Line||上行
南海线|Nankai Line||下行
```

Routes with exactly the same first-language name are grouped together in the header. `南海线` and `南海线支线` are not grouped together. Extra spaces within a name may also cause routes to be treated as different lines.

#### Line code and service type

Enter one of these three formats in MTR's **route number** field:

```text
各停|Local||RA
RA [各停]|RA [Local]
RA 各停|RA Local
```

All three mean line code `RA`, first-language service type `各停`, and English service type `Local`. English service types may contain spaces:

```text
特急|Limited Express||RA
RA [特急]|RA [Limited Express]
RA 特急|RA Limited Express
```

In the last two formats, use the same line code in both language parts. Do not write `RA 各停|RB Local`.

If no line code is needed, enter a recognized service type alone, such as `快速|Rapid`, `普通|Local`, or `特急|Limited Express`. A single label such as `Rapid` or `Limited Express` also works. The header badge is hidden, while the service row shows the label and its background color. For custom types not listed in the color table, use a form such as `区間快速|Semi Rapid||`; the trailing `||` explicitly leaves the code empty.

Service labels are displayed as entered. A monolingual label such as 普通 remains unchanged on both language pages; an explicit 普通|Local input displays the two supplied parts. Code-only and missing-grade rows retain their existing order-label or enlarged-line-name layouts without inventing a grade.

If the route number is empty or provides no line code, the square badge in the header is hidden, with no placeholder dash. The line name uses the freed space. Each line is checked separately; lines with a code keep their badges.

#### Destination station code

A destination name can include a station code:

```text
桥本|Hashimoto||NK04
```

For a service with line code `NK`, the destination badge shows `NK / 04`. A shared destination can contain multiple codes:

```text
桥本|Hashimoto||JK01NK04
```

- A `JK` service shows `JK01`.
- An `NK` service shows `NK04`.
- Services with other line codes do not show this badge.

**The line code must match the station code's letter prefix exactly, including case.** For example, neither `K` nor `nk` matches `NK04`. Station codes use English letters followed by digits; leading zeros are preserved.

A matching code in the arrival destination takes priority. If its line code is missing, the pack checks stops from the current platform onward on that service’s actual route, matching an exact destination name in either language, then reads the current station name for its code. For example, an old arrival may still contain `NK04` while the station is now named `桥本|Hashimoto||NK04JC04`; a JC service can then recover `JC04`. Ambiguous names at different stations, an unknown route, missing matching codes, or a malformed original suffix do not trigger a guess: the destination badge stays hidden. A manual `rowDestination` override uses only the supplied content. The destination name remains visible, and the header's line badge is unaffected. These display codes do not configure actual platform numbers or stopping patterns in MTR.

### Code-only JC and English-only data

Entering only `JC` as the route number is supported: the line badge remains available and the destination can match `JC04`, without requiring a service type. For an English-only setup, use:

```text
Line name: Chuo Line
Route number: JC
Destination name: Hashimoto||NK04JC04
```

To include a service type, use `Rapid||JC`, `JC Rapid`, or `JC [Rapid]`. Multi-word types work as `Limited Express||JC`, `JC Limited Express`, or `JC [Limited Express]`. Entering only `Rapid` specifies a service type without a line code, so the pack will not invent a JC badge.

When names, direction station names, and service types are all English-only, the default display automatically stays in English, including `for`, `Cars`, and `Not in service`, instead of switching to Japanese every eight seconds. A single-line display without a service type uses `First / Next`; two-route displays still use the enlarged line name. Chinese or Japanese content keeps the usual bilingual cycle. An explicit `language` setting of `ja` or `en` takes priority.

### 3. Service-type background colors

Badge colors are matched against complete service names. Each grade uses one color across all trains, housings and language pages. The PIDS no longer checks individual vehicle IDs for colors; car counts and ATOS are still available. The full palette is in the table under “等级背景色”. Vehicle resource packs are unaffected.

Display text and recognition are separate. The service wording supplied in the route-number field is shown without automatic abbreviations, expansions, translation, case changes or inserted spaces. Existing | / || separators still select languages and introduce the line code. A missing language reuses the other original label. Recognition for colors and ATOS ignores case and whitespace: Ltd.Exp., ltd. exp., LimitedExpress and Limited Express all identify Limited Express and use #FF2929, while each keeps its own display spelling.

For example, Limited Express stays Limited Express, Ltd.Exp. stays Ltd.Exp., CommuterRapid stays compact, and Chūō Special Rapid retains its accent. The three automatic S.R. display replacements have been removed.

| Service type | Single-route English layout | Two-route English layout |
|---|---|---|
| 各駅停車 / 各停 / 普通 | Local | Local |
| 快速 | Rapid | Rapid |
| 急行 | Express | Express |
| 特急 | Limited Express | Limited Express |
| 特快 / 特別快速 / 特别快速 | Special Rapid | Special Rapid (enlarged single line) |
| 通勤快速 | Commuter Rapid (centered single line) | Commuter Rapid (centered single line) |
| 中央特快 | Chuo ↵ Special Rapid (left-aligned) | Chuo ↵ Special Rapid (left-aligned) |
| 青梅特快 | Ome ↵ Special Rapid (left-aligned) | Ome ↵ Special Rapid (left-aligned) |
| 通勤特快 | Commuter ↵ Special Rapid (left-aligned) | Commuter ↵ Special Rapid (left-aligned) |

Wrapping only fits the supplied text inside the existing grade area. Chuo/Ome/Commuter Special Rapid names use two fixed left-aligned lines in both layouts: the original prefix above the original Special Rapid wording. Limited Express and Commuter Rapid retain one line. Compact forms of these three grades wrap after the original prefix without adding spaces; other compact input is fitted as a whole. Paired lines share one natural-proportion font size; existing badge geometry and spacing remain.

The renderer measures actual glyph outlines and fits each existing grade region without stretching letters. Long text shrinks naturally. Single-route badge dimensions and approved two-route positions and filled backgrounds remain.

Custom labels retain their wording and capitalization. Two-route custom labels use one centered line at the largest natural size that fits; single-route labels keep their measured one/two-line fitting. Unknown labels use the neutral background, and a missing grade is never replaced with Local. Recognized identity only controls colors and announcements, not the displayed name.

### 4. What the display shows

#### Header lines and directions

The header shows at most **two lines** after grouping same-name opposite-direction routes. It uses the first two groups in the existing first-language name order, side by side, without a third column or paging. Arrival data and car-count detection remain unchanged.

Each line's direction text contains up to **three station names, including the destination**. Intermediate stations are selected only from stops served by that route after the current station. Transfer stations are prioritized; remaining spaces are filled with stations spread along the route. Skipped stations are not added. Names are shown in travel order, with the destination last.

Header line names are white. When multiple lines are shown, line names in the service rows use their respective line colors. Long names shrink automatically to fit.

In two-route service rows, the route title is centered across the full service-column width, while the grade background below is slightly inset. Grade lettering keeps its current font size and position. Time and destination columns retain their existing positions.

#### Two services and their times

Normally, the display shows the next two services supplied by the game. The lower row no longer alternates with a train-position map.

The default time is **departure time = arrival time + dwell time**, shown as `HH:mm` in the client's system time zone, not Minecraft's day/night time. Opening the doors does not replace the time with a boarding message.

Except when English-only data keeps the display in English, the language changes every **8 seconds**: 8 seconds for the first language, then 8 seconds for English, for a 16-second cycle. The first language is the Chinese or Japanese text you entered; there is no separate three-language cycle. Service data refreshes every **1 second**.

#### Train-approaching message

When the first service is **more than 5 seconds and no more than 50 seconds** from its expected arrival, the second row may show a yellow approaching message, alternating on and off every 0.5 seconds. The first service remains visible. A following service terminating here no longer prevents the first service's approach alert.

At 5 seconds or less before expected arrival, the message ends and the second service returns. It also ends early if the matching train has been detected stopped with its doors opening. Vehicle synchronization and data refreshes can introduce a short delay.

This pack does not show boarding messages, door-closing warnings, or a live train-position map.

#### Train-approaching chime

The supplied ATOS chime plays once when the approaching message first lights up, never on every half-second blink. **Within each client, a given service at a given actual platform has one announcement playhead.** Other screens still display the alert without repeating the sound, including a mixture of all four orientation/voice presets. Late-loading or recreated screens use the timeline below to decide whether to join. An existing active announcement keeps one shared playhead. Different actual platforms are independent, even when their displayed numbers or names match.

ETA fluctuations and schedule corrections of up to one second do not replay the same scheduled service. Stopped/open-door observations also survive these small corrections, preventing a restart on arrival. Once started, the chime and voice finish naturally despite ETA changes, temporarily missing services, cancellation, hidden rows or ordinary custom-message overrides. An independent playback task maintains position and the car-count tail even when the original display stops rendering or its chunk unloads. Other nearby PIDS supply the current playhead; reloading a display does not restart it. The task releases itself after completion or when leaving the world. A new service at the same platform waits for the complete previous announcement, including its car count, plus 0.5 seconds; chime-only playback still reserves at least four seconds.

The original chime-only clip is about 3.35 seconds, converted to mono Vorbis for positional playback. RMS level is increased by about 6.14 dB over the original mono downmix and 1.95 dB over the previous release. Output loudness is approximately -12.18 LUFS, with -1.02 dBTP true peak and no clipped samples. The original MP3 is unchanged.

**Each PIDS controller-block centre defines a sphere with a 50-block radius, including vertical distance.** A platform announcement always uses the nearest loaded PIDS bound to that actual platform and native linear attenuation from its centre. Standing 5 blocks from screen A and then 5 blocks from screen B uses the same attenuation and volume settings. At or beyond 50 blocks from every eligible PIDS, or when none are loaded, playback is silent. Returning inside any sphere restores the current playhead without restarting. The car-count tail follows the same rule, and neither overlapping spheres nor front/back faces add duplicate audio. The game's Blocks and master-volume settings also apply; volume approaches zero near the spherical boundary.

#### Joining an announcement from the arrival countdown

The fixed timeline begins **50 seconds before arrival**: elapsed time is `50 seconds - remaining arrival time`. The first polling/blink interval, under one second, retains the original continuous recording. A later-loaded display joins the current shared phrase at an approximately one-second entry point, then completes subsequent phrases and the actual car-count tail. Small ETA corrections do not repeatedly seek a sound already playing.

For a 20-second announcement, loading at 40 seconds before arrival joins at about 10 seconds into the recording. At 30 seconds the recording has already ended, so loading then or at 20 seconds produces no announcement. The actual cutoff uses the selected main recording, natural pause and supported car-count tail; the duration is not fixed to 20 seconds. Visual approach information retains its existing five-second cutoff.

Late entry reuses common opening, platform, grade/arrival and safety phrases, with entry variants only within each short phrase. Original complete recordings remain available for normal playback. Section levels are calibrated against the original full recordings; original pitch, mono24kHz audio and the nearest PIDS's 50-block spherical range are retained. Each continuation waits for native completion of the previous section before starting.

On servers, MTR's arrival timestamps already account for the client/server clock difference. Every player needs the same updated pack. Network, data refresh and audio submission can introduce small differences; sample-accurate synchronization is not promised. If a resource reload or device reset loses the native sound, an unfinished timeline can be re-entered from the current offset. A shared active-owner lease prevents duplicate instances across displays and presets, while completed-service markers prevent replay.

#### ATOS male/female approach announcements

Male presets use the original Tsuda recordings; female presets use the original Mukaiyama recordings. Each bank uses its own opening, platforms 1–15, grades, arrival phrase, safety warning and car count, without mixing voices or changing pitch. Loudness is normalized, and mild noise reduction is applied where a reliable profile is available. The instrumental approach chime is shared.

One actual platform/service still plays only once: the first triggering preset selects the voice for that playback. Other displays supply nearby speaker positions without adding another voice. Use one voice per platform for predictable selection. Both banks retain grade/car-count selection, the 50-to-5-second alert window, a 50-block spherical range and approximately one-second timeline entry.

Both banks use **mono 24 kHz Vorbis q3**, with eager preload disabled for shared entry clips. For equal duration, decoded PCM16 uses roughly half as many bytes as at 48 kHz. Lower OGG bitrate primarily reduces package size; it does not by itself reduce decoded memory by the same proportion. Original masters remain in the development workspace. Actual game memory depends on the sounds used and the game's cache and requires in-game measurement.

Each spoken fragment is processed to reduce continuous hiss while retaining speech detail and the original duration. Some noise overlapping the voice and artifacts already present in the lossy source may remain; use the audio preview to assess the result.

Platform labels match the recording table by their **complete literal text**. Currently only the exact ASCII labels `1` through `15` select the corresponding numbered recordings. No full-width conversion, whitespace trimming, leading-zero removal, numeric parsing, language splitting or suffix removal is performed. For example, `01`, `１`, `1番線`, ` 1`, `1 ` and `1|01` are all distinct from `1`; unsupported exact labels play only the chime. A manual `platform` override follows the same rule and falls back to the arrival label only when unset or an empty string. Male/female voices, initial playback and late entry all use this exact matching.

Supported spoken grades are **各駅停車（各停）, 普通, 快速, 特別快速, 中央特快, 青梅特快, 通勤特快, 通勤快速, 急行 and 特急**. Existing known Chinese and English aliases are recognized. An explicit `普通|Local` uses 普通; English-only `Local` uses 各駅停車. 特快 uses 特別快速. Other/empty grades, including Rapid Urban/Rabbit/Acty, use the generic 列車が参ります phrase.

The phrase order is `まもなく、[1–15]番線に、[grade]、参ります。危ないですから黄色い線までお下がり下さい。この列車は、8両です。`; the generic form replaces the grade and 参ります with `列車が参ります`. The final count comes from that arrival's actual `carCount`, independently of whether the screen shows car counts. Original recordings support **1–12, 14 and 15 cars**. Missing, invalid or unsupported counts (such as 13) omit the final count sentence while retaining the rest of the announcement.

The main recording, including the chime, remains one continuous clip of about 15–18 seconds. After it finishes, a natural pause leads into one complete `この列車は、N両です` clip, adding about 3–5.5 seconds. Native playback completion is checked to prevent overlap; the whole sequence shares the platform reservation. Visual timing is now **50 to more than 5 seconds** before arrival, with the same 50-block attenuation and shared platform/trip deduplication. A started voice and its queued car count finish even when the visual alert ends or the original PIDS chunk unloads, using the nearest available PIDS.

#### Services terminating here

If a service's destination exactly matches the first-language name of the station containing its platform, that service row shows only red text:

- First-language page: `当駅止まり`
- English page: `Not in service`

The row's original time, service type, codes, and car count are hidden. The message aligns with the destination area. The comparison ignores the English part and code information, but does not use approximate name matching.

That line's header direction text is also blanked, while its name and badge remain. Other lines keep their directions. A terminating first service does not trigger its own approach alert. When the first service is approaching normally, its alert may temporarily replace a following terminating-service message; the latter returns at five seconds before arrival.

#### Car counts

Both the car-count digits and the “両 / Cars” unit use smaller text, centered vertically within their areas on the right.

The display compares all services currently received, including the third service and later ones:

| Example car counts | Result |
|---|---|
| 8, 8, 8 | Car counts are hidden |
| 8, 8, 12 | Both visible services show `8 両 / 8 Cars` |
| Some counts are unknown | Unknown values do not establish a difference, and no counts are invented |

“All services” means those currently supplied to this display by the game, not a full-day timetable that has not yet been synchronized.

#### Custom messages, hidden rows, and no-service messages

The pack supports ordinary JCM custom messages for the first two rows, hidden rows, and a hidden platform number. Unformatted messages keep replacing their assigned row continuously. Ordinary messages and hidden settings retain their priority over automatic approach alerts. Formatted `@notice` messages instead join the announcement queue and may be entered in any custom-message slot, including the third slot.

#### Scrolling announcements / お知らせ

Enter a notice in any JCM custom-message box (the third box is recommended). You do not need to select “hide arrival”:

```text
@notice #FFFF00 Some trains are delayed due to track inspections. Please listen for platform announcements.
```

Separate the `@notice` prefix from the body with a space. An optional `#RRGGBB` or `#RGB` sets the initial text colour; yellow is the default. Insert `{#HEX}` inside the body to change the colour of following text, for example:

```text
@notice #FF0000 [SERVICE UPDATE] {#FFFF00}Some trains are delayed due to track inspections.
```

- When the first service is initially identified or changes, normal information begins with a complete first-language page (Chinese/Japanese). First language → English is one round; after two complete rounds, one notice temporarily replaces the lower row. At the default eight seconds per page, this is 32 seconds. Changing `languageSeconds` restarts the two rounds using the new interval. Fixed first-language, fixed English and automatic English-only displays use the same equivalent four-page duration. Updates only to the following service or normal ETA/deviation data do not restart the first service's count.
- Only the first three custom-message slots are read. Notices rotate in slot 1 → slot 2 → slot 3 order, skipping slots without a scrolling notice. Each insertion plays one slot, scrolls right to left once and restores the second service after the entire text clears the window. Two new complete normal rounds precede the next slot. A first-service change preserves the queue position; an unfinished notice is interrupted for the new timetable and retried from the beginning after two rounds. The first service, header and platform number remain visible. Text crosses the central window in about five seconds; a complete notice takes longer according to its length.
- Both red fades stay fixed and fill the inner lower row up to its display boundaries, retaining the uniform black gap from the housing. A separate small pure-black gap separates each fade from the central scrolling window; vertically centred text is clipped to that window and never enters the fades or gaps.
- Approach alerts preempt notices. Approach displays, or periods when the lower row is hidden or occupied by an ordinary permanent message, do not contribute to normal timetable rounds. Once the higher-priority display clears, two new complete normal rounds precede the next notice; an interrupted scroll restarts from the beginning. A hidden lower row or an ordinary message in that row prevents notice insertion. The existing no-service display remains when no valid first service is available.
- The body is literal text with no automatic translation; a pipe `|` remains a pipe. Missing prefixes, malformed commands and empty notices retain ordinary custom-message behaviour. Removing a notice clears it on the next data poll.
- Scrolling is capped at 20 updates per second. Arrivals are polled once per second. The shared line index refreshes immediately when the data set or entry counts change. Edits to existing line and station names can take up to about five seconds to reach the display.

With no services, or when the first service is more than the default 120 minutes away, the display shows `☆本日の運転は終了しました☆` on the first-language page or `Service has ended for today` on the English page. No timetable reminder appears underneath. If a train should be listed, check the route, operating schedule, and platform binding.

### 5. Troubleshooting

| Problem | What to check |
|---|---|
| The presets are missing | Check that JCM is installed and the pack is enabled in the current instance, then press F3+T. Older presets may need to be replaced with the current west&north / east&south presets. |
| The old appearance remains after an update | Disable older copies of the pack, check that you replaced the ZIP in the current instance, and press F3+T. |
| The display is black | Check mod versions, pack integrity, and duplicate older packs; select this pack's preset again. If it persists, provide a screenshot and the current session's `logs/latest.log`. |
| A train is nearby but no service is listed | Check that the display is bound to the platform where that train actually stops, along with its MTR route and operating schedule. A nearby train does not necessarily stop at this platform. |
| The platform number is on the other side | Use the north/south or east/west placement table, not your current viewpoint. |
| The destination badge is missing | Check `||`, the letter prefix, capitalization, and digits; for example, line `NK` matches destination code `NK04`. |
| A line is missing from the header | Check whether same-name routes were grouped and whether the result exceeds two lines. The header is not limited to the next two services. |
| A service type has no dedicated color | Check for an exact name match in the color table. For example, `区間快速` is not matched as `快速`. |
| The English page still shows Chinese or Japanese | The name may lack its `|English` part. The pack does not translate automatically. |
| Car counts are missing | Counts are hidden when all known counts are the same or the relevant counts are unknown. |
| A red terminating-service message appears | Check whether the destination matches this station's first-language name. |
| Some characters are missing | The bundled font is subsetted and may not include rare CJK extension characters. Try a common character to confirm. |

### 6. Optional: language and resolution settings

The default settings are ready to use. To change them, edit this file inside the resource pack:

```text
assets/jsblock/joban_custom_resources.json
```

Find `scriptTexts` in the relevant preset and edit its existing `YAMANOTE_OPTIONS`. For example, to switch languages every 10 seconds in the west&north preset:

```json
"scriptTexts": ["var YAMANOTE_OPTIONS = { platformSide: 'left', language: 'cycle', languageSeconds: 10 };"]
```

`platformSide` is an internal setting: west&north still uses `left`, and east&south still uses `right`.

This is a field within a preset, not a complete file. Keep the other file contents, and preserve `platformSide: 'right'` in the east&south preset. Edit each intended orientation/voice preset separately. Save the changes back into the pack and press F3+T. Personal edits need to be reapplied when you replace the ZIP with a newer version.

| Option | Default | Purpose |
|---|---|---|
| `language` | `'cycle'` | `'cycle'` alternates languages, or stays in English for English-only data; `'ja'` keeps the first language (Chinese or Japanese); `'en'` keeps English |
| `languageSeconds` | `8` | Seconds per language page; applies only when cycling, with a minimum of 1 second |
| `timeSource` | `'departure'` | `'departure'` shows departure times; `'arrival'` shows arrival times |
| `textureWidth` | `1024` | Resolution width, from 512 to 1600; the actual width is adjusted to a multiple of 4, and height is one quarter of the width |

The default resolution is 1024×256. Higher resolutions increase image-processing and video-memory costs, so start with the default. The compressed pack size is not a direct measure of in-game frame rate.

The image updates when content or animation changes. Local changes such as a moving notice or a blinking approach message redraw and upload only the affected pixel region, while both faces continue to share one texture. Service polling remains once per second, notice movement uses 50 ms steps, and approach blinking uses 500 ms intervals. Active ATOS playback keeps its independent nearest-speaker and phrase-continuation task; idle displays skip unnecessary sound synchronization checks.

## 已知等级英文 / English names for known grades

所有等级均显示所填写的原文，不自动补全英文或替换缩写。示例：`青梅特快||JC` 在两种语言页面都显示 `青梅特快`；`青梅特快|Ome Special Rapid||JC` 才分别显示这两段原文。识别等级时忽略大小写和空白，仅用于配色及播报，站台号仍按完整原文严格匹配。

Rapid Urban、Rapid Rabbit、Rapid Acty（含原日文写法）按未知自定义等级处理，底色为 `#252A32`，保留输入原文。只填了一种语言时沿用原文；如需日英分别显示，请显式填写两种名称，例如 `快速アーバン|Rapid Urban||JT`。

All grades retain the supplied wording. No English name or abbreviation is inserted automatically. For example, 青梅特快||JC displays 青梅特快 on both language pages; 青梅特快|Ome Special Rapid||JC displays the two explicit labels. Grade recognition ignores case and whitespace only for colors and announcements. Platform labels still require a complete literal match.

Rapid Urban, Rapid Rabbit and Rapid Acty (including the former Japanese spellings) are custom grades with the `#252A32` background. They retain the entered wording and use the same fitting and generic ATOS phrase as other custom grades. Supply both labels explicitly when needed.
