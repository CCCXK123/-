/* ===== content.js — 科普内容与参考文献数据 ===== */
/* 所有事实性论断均标注来源；参考文献见下方 REFS。 */
window.CONTENT = (function () {

  /* ---------------- 前额叶是什么 ---------------- */
  var pfc = {
    title: '前额叶（Prefrontal Cortex, PFC）是什么',
    html: [
      '<p>前额叶位于大脑额叶的最前端，约占人类大脑皮层的 <b>约 10%–17%</b>，是进化上出现最晚、发育最慢的脑区。它不像运动皮层那样直接指挥肌肉，也不像视觉皮层那样处理图像——它负责的是<b>「指挥其他脑区怎么干活」</b>这件事本身。</p>',
      '<p>神经心理学把前额叶承担的这类能力统称为<b>执行功能（Executive Functions, EFs）</b>。这是一个有共识的框架，Diamond 在《Annual Review of Psychology》的综述里把它归纳为三大核心 + 三大高级：</p>',
      '<table>',
      '<tr><th>层级</th><th>能力</th><th>生活中的样子</th></tr>',
      '<tr><td rowspan="3">核心 EF</td><td><b>抑制控制</b>（Inhibitory Control）</td><td>想刷手机时先把手放下；被冒犯时不立刻回怼；屏蔽噪声读完一页书</td></tr>',
      '<tr><td><b>工作记忆</b>（Working Memory）</td><td>心算 27×3 时把中间结果「挂在脑子里」；听完一段话还能复述要点</td></tr>',
      '<tr><td><b>认知灵活性</b>（Cognitive Flexibility）</td><td>方案被否后能立刻换思路；从「写代码」切到「开会」不卡壳</td></tr>',
      '<tr><td rowspan="3">高级 EF</td><td>推理</td><td>从零散信息推出结论</td></tr>',
      '<tr><td>问题解决</td><td>拆解一个没做过的任务</td></tr>',
      '<tr><td>计划</td><td>把一个月的目标排成可执行的日程</td></tr>',
      '</table>',
      '<blockquote>Diamond 的原文概括：执行功能让我们「在脑子里摆弄想法、在行动前先想一想、应对从未遇过的新挑战、抵抗诱惑、保持专注」（Diamond, 2013）。</blockquote>',
      '<h3>它发育得最晚，也退化得最早</h3>',
      '<p>Giedd 团队 1999 年在《Nature Neuroscience》发表里程碑式的纵向 MRI 研究（145 名健康被试、243 次扫描），发现额叶灰质体积呈「先增厚、后修剪」的倒 U 型曲线，<b>前额叶是所有皮层区域中最晚完成成熟的</b>。Sowell 等（2001, <i>J. Neuroscience</i>）进一步用高分辨率 MRI 定位发现：从青春期到成年，背侧额叶仍在持续重塑，而这一区域正是控制执行认知功能的区域。</p>',
      '<div class="note info"><b>一个常被误传的点：</b>「大脑 25 岁就发育完全」是流行说法，并非严格科学结论。Giedd 当年的数据只追踪到 20 岁，25 是推测值；他自己都说过「如果要挑一个数字，大概到 25 岁」。2025 年一项覆盖 4200 余人（婴儿至 90 岁）的白质网络研究显示，脑网络效率的关键塑造期一直延续到 <b>约 32 岁</b>。所以更准确的说法是：前额叶的成熟是一个延续到 30 岁以后的漫长过程。</div>',
      '<h3>为什么它这么重要</h3>',
      '<p>Diamond（2013）汇总的证据显示，执行功能与下面这些几乎每一项都相关：</p>',
      '<ul>',
      '<li><b>心理健康</b>：成瘾、ADHD、品行障碍、抑郁、强迫症、精神分裂症中均可见执行功能受损</li>',
      '<li><b>身体健康</b>：执行功能较差与肥胖、暴食、物质滥用、治疗依从性差相关</li>',
      '<li><b>学业</b>：执行功能对「入学准备」的预测力<b>强于智商</b>，并能预测整个学龄段的数学与阅读能力</li>',
      '<li><b>职业与生活</b>：与工作效率、婚姻和谐度、公共安全（冲动行为、暴力、情绪失控）均相关</li>',
      '</ul>',
      '<p>换句话说，前额叶不是「聪明」的器官，而是<b>「把聪明用在正确地方」</b>的器官。</p>'
    ].join('')
  };

  /* ---------------- 锻炼的好处 ---------------- */
  var benefits = {
    title: '锻炼前额叶到底有没有用？证据分层看清楚',
    html: [
      '<p>这块必须说实话，因为网络上的宣传远超过研究能支撑的范围。下面按证据强度从高到低排列。</p>',

      '<h3>一、有氧运动 → 前额叶：证据最硬</h3>',
      '<p>这是目前证据最扎实的一条路径，而且有神经影像层面的直接证据：</p>',
      '<ul>',
      '<li><b>荟萃分析（18 项随机对照试验）</b>：Colcombe &amp; Kramer（2003, <i>Psychological Science</i>）发现运动对认知的改善中，<b>执行功能的提升幅度大于其他认知域</b>（如加工速度）——说明有氧运动对前额叶有相对特异性。</li>',
      '<li><b>脑结构证据</b>：Colcombe 等（2006, <i>J. Gerontol. A</i>）对 59 名 60–79 岁久坐老人做 6 个月随机对照干预，有氧组<b>灰质与白质体积显著增加</b>，对照组没有。</li>',
      '<li><b>机制</b>：Hillman、Erickson &amp; Kramer（2008, <i>Nature Reviews Neuroscience</i>）综述指出，有氧适能较高者在<b>前额叶、顶叶</b>的灰质体积更大、白质完整性更好；动物与人体研究提示 BDNF、脑血流与神经新生参与其中。</li>',
      '<li><b>剂量</b>：一项纳入多项研究的系统综述与荟萃分析（<i>Sports Medicine</i>, 2020）显示，<b>每周 3–4 次、中高强度、持续 1–3 个月</b>的方案对执行功能改善更明显；受试者中原本久坐的人获益最大。</li>',
      '<li><b>单次也有效</b>：Chen 等（2020, <i>J. Clinical Medicine</i>）综述发现，一次中等强度有氧运动即可改善抑制控制表现，Stroop 干扰量下降与<b>背外侧前额叶（DLPFC）氧合血红蛋白升高</b>相关。</li>',
      '</ul>',
      '<div class="note ok"><b>世界卫生组织（WHO, 2020）指南</b>：18–64 岁成年人每周应进行至少 <b>150 分钟中等强度</b>有氧身体活动（或 75 分钟高强度），并每周 ≥2 天做肌肉强化活动。这是「保护前额叶」性价比最高的一件事——比任何脑力游戏都更值得优先做。</div>',

      '<h3>二、认知训练游戏 → 任务本身：可靠</h3>',
      '<p>你在这个网站里玩的所有游戏，都属于这一类。关于它的真实效力：</p>',
      '<ul>',
      '<li><b>近迁移（near transfer）可靠</b>：Melby-Lervåg &amp; Hulme（2013, <i>Developmental Psychology</i>）的荟萃分析显示，工作记忆训练对<b>类似的记忆任务</b>有稳定提升，效应量约 <b>0.5–0.8</b>。也就是说：练舒尔特，你的视觉搜索速度确实会变快；练 N-back，你的 N-back 成绩确实会提高。</li>',
      '<li><b>远迁移（far transfer）证据弱</b>：同一研究及后续更新（Melby-Lervåg, Redick &amp; Hulme, 2016, <i>Perspectives on Psychological Science</i>）发现，在设置「活跃对照组」的严格实验中，训练对<b>流体智力等一般能力</b>的迁移效应接近 <b>0</b>（Hedges g ≈ 0.05）。</li>',
      '<li><b>经典争议案例</b>：Jaeggi 等（2008, <i>PNAS</i>）报告 8–19 天双 N-back 训练可提升流体智力、且存在剂量效应，引发巨大关注；但 Redick 等（2013, <i>JEP: General</i>）用 17 项迁移测量、含活跃对照组的严格复现<b>未能重复</b>该结果（「17 个方差分析中没有任何 Group×Session 交互显著」）。</li>',
      '</ul>',
      '<blockquote>诚实的结论：<b>这些游戏能让你在这个游戏上变强，也能提升与之高度相似的能力</b>；但不要指望玩两周就「变聪明」。把认知训练当作<b>运动之外的补充</b>，而不是替代品。</blockquote>',

      '<h3>三、ADHD 等临床人群：有改善证据</h3>',
      '<ul>',
      '<li>Klingberg 等（2005, <i>JAACAP</i>）的随机对照试验显示，计算机化工作记忆训练可改善 ADHD 儿童的工作记忆与部分行为指标。</li>',
      '<li>一项 16 周计算机化认知训练（含 Stroop、Go/No-Go、任务切换）的纵向 fMRI 研究发现，ADHD 儿童的抑制控制任务表现改善、临床症状评分下降，并伴随脑功能指标改变。</li>',
      '<li>一项针对学龄 ADHD 儿童运动干预的系统综述与荟萃分析（<i>BMC Public Health</i>, 2025）发现，运动干预在 <b>Stroop 与 Go/No-Go 任务</b>上均显著改善了抑制控制。</li>',
      '</ul>',
      '<div class="note"><b>重要提醒：</b>以上均为「群体统计层面的改善」，不等于对个体有诊断或治疗价值。若你或家人存在明显的注意力、冲动控制或情绪调节问题，请就诊精神科/神经内科，本工具只能作为辅助练习。</div>',

      '<h3>四、被验证有效的「非游戏」因素</h3>',
      '<p>Diamond（2013）特别强调：以下因素会<b>直接损害</b>执行功能，反过来说，改善它们就是最有效的「训练」：</p>',
      '<ul>',
      '<li><b>睡眠不足</b> — 直接削弱抑制控制与工作记忆</li>',
      '<li><b>压力与孤独</b> — 慢性压力会损伤前额叶功能</li>',
      '<li><b>缺乏运动</b> — 见上文，这是最大的一条</li>',
      '<li><b>正念/冥想、复杂有氧运动、传统武术、音乐训练</b> — 均有一定证据支持对执行功能的促进作用</li>',
      '</ul>'
    ].join('')
  };

  /* ---------------- 前额叶受损 ---------------- */
  var damage = {
    title: '当前额叶受损：会发生什么',
    html: [
      '<p>了解损伤表现，反过来能更直观地理解前额叶在做什么。以下内容整理自神经内科临床综述（Pirau &amp; Lui, <i>StatPearls</i>, 2022）与额叶综合征相关文献。</p>',

      '<h3>起点：Phineas Gage（1848）</h3>',
      '<p>美国铁路工头盖奇在爆破事故中被一根长 1.1 米、直径 3.2 厘米的铁夯从左脸颊穿入、颅顶穿出。他活了下来，<b>智力、语言、记忆基本完好</b>，但性格发生剧变：从「公认最能干、最可靠的工头」变成冲动、粗鲁、无法按计划行事、情绪失控、难以相处的人。</p>',
      '<p>Van Horn 等（2012, <i>PLoS ONE</i>）用盖奇的头骨与 CT 数据重建了铁棒的穿行轨迹，模型显示其<b>左侧眶额皮层</b>受到严重损伤，且连接左额叶与边缘系统的多条白质通路被破坏。</p>',
      '<div class="note info"><b>这个案例最关键的一点：</b>盖奇的智商测试「正常」。这说明前额叶损伤不会让你变笨，但会让你<b>不再是原来那个人</b>——判断力、计划性、情绪控制、社会行为会先崩掉。现代神经心理学也纠正了一些夸大传闻：文献可确认的表现主要是易怒与挫折感、轻度记忆损害、计划困难。</div>',

      '<h3>不同部位受损，表现不同</h3>',
      '<table>',
      '<tr><th>受损区域</th><th>典型表现</th></tr>',
      '<tr><td><b>腹内侧 / 眶额皮层</b></td><td>冲动、判断力下降、<b>抑制解除</b>、情绪不稳、社交场合行为失当——经典的「额叶人格」。盖奇属于此类。</td></tr>',
      '<tr><td><b>背外侧前额叶（DLPFC）</b></td><td>工作记忆下降、规则学习困难、计划与问题解决能力受损、注意力涣散、动机下降。可表现为「假性抑郁」：主动性降低、言语减少、行为迟缓（abulia / 意志减退）。</td></tr>',
      '<tr><td><b>前扣带皮层</b></td><td>与注意背后的动机有关；损伤与抑郁、PTSD、强迫症等精神障碍相关联。</td></tr>',
      '<tr><td><b>内侧额叶 / 辅助运动区</b></td><td>精神运动迟缓、意志减退</td></tr>',
      '<tr><td><b>广泛额叶损伤</b></td><td>「额叶综合征」谱系：抑制解除、情绪多变、淡漠、易分心、挫折耐受差</td></tr>',
      '</table>',

      '<h3>临床上的「额叶综合征」（Frontal Lobe Syndrome）</h3>',
      '<p>当损害累及前额叶及其网络时，会出现一组共同主题为<b>「执行失调」</b>的症状：</p>',
      '<ul>',
      '<li><b>人格与人际</b>：性格剧变、缺乏社交觉察、抑制解除、易怒、不恰当或高风险的冒失行为</li>',
      '<li><b>认知</b>：计划、问题解决、专注、执行任务的能力下降；但常规记忆与语言检查可能「看起来正常」</li>',
      '<li><b>情绪与动机</b>：淡漠、缺乏动机、情绪爆发，或抑郁、焦虑表现</li>',
      '<li><b>洞察力缺失</b>：患者常<b>意识不到自己有问题</b>，而家人最先发现异常——这是额叶损伤极具特征的一点</li>',
      '<li><b>严重时</b>：出现抓握反射等「额叶释放征」、运动不能（akinesia）、缄默</li>',
      '</ul>',

      '<h3>常见病因</h3>',
      '<p>创伤性脑损伤（TBI，最常见）、脑卒中、脑肿瘤、神经退行性疾病（额颞叶痴呆 FTD、阿尔茨海默病、帕金森病）、感染与炎症、多发性硬化等。</p>',
      '<div class="note"><b>注意区分两种「前额叶受损」：</b>网络上流行说的「前额叶罢工了 / 前额叶废了」，指的是<b>疲劳、熬夜、压力导致的执行功能暂时性下降</b>，是功能性的、可恢复的；而临床上说的前额叶受损是<b>结构性损伤</b>。两者严重程度完全不同，不要用前者自我诊断，也不要因此忽视后者的就医必要性。</div>',

      '<h3>怎么保护它</h3>',
      '<ol>',
      '<li>乘车骑车戴头盔、防跌倒（尤其老年人）——预防 TBI 是最有效的「保护」</li>',
      '<li>控制血压血糖血脂、及时治疗脑血管疾病</li>',
      '<li>保证睡眠、管理压力、规律运动、戒烟限酒</li>',
      '<li>出现明显的性格改变、计划能力骤降、冲动失控，尽早就诊神经内科</li>',
      '</ol>'
    ].join('')
  };

  /* ---------------- 训练方案建议 ---------------- */
  var plan = {
    title: '怎么练：一个可执行的最小方案',
    html: [
      '<p>基于上面的证据分层，一个理性、不折腾的方案是这样的：</p>',
      '<table>',
      '<tr><th>优先级</th><th>做什么</th><th>剂量</th></tr>',
      '<tr><td><b>1（基础）</b></td><td>规律有氧运动</td><td>每周 150 分钟中等强度（WHO 标准）</td></tr>',
      '<tr><td><b>2（基础）</b></td><td>睡眠与压力管理</td><td>每晚 7–9 小时；每天 10 分钟正念呼吸</td></tr>',
      '<tr><td><b>3（补充）</b></td><td>本网站游戏</td><td>每天 10–15 分钟，2–3 个模块，4–8 周后看趋势</td></tr>',
      '</table>',
      '<h3>游戏训练的具体建议</h3>',
      '<ul>',
      '<li><b>每次 10–15 分钟为宜</b>。研究提示延长到 20 分钟以上收益递减，超过每周 3 次以上频次反而可能削弱效果（Lampit 等对老年人计算机化训练的分析）。</li>',
      '<li><b>不要只练一个游戏</b>。抑制控制（Stroop、Go/No-Go）、工作记忆（N-back）、视觉搜索与注意（旋转盘、舒尔特）分属不同子系统，轮换练覆盖面更全。</li>',
      '<li><b>用「成绩曲线」而不是单次成绩判断进步</b>。单次波动很大（睡眠、情绪、时间点都有影响），至少看 5–10 次记录的趋势。</li>',
      '<li><b>难度要「有点吃力但不崩溃」</b>。全部轻松通过说明该升难度了；连续失败则应降一档。</li>',
      '<li><b>练完就停</b>。不要为了刷记录连续玩一小时——那是消耗而非训练。</li>',
      '</ul>',
      '<div class="note ok"><b>关于「旋转数字盘」为什么有效：</b>它同时压载了三条通路——① 旋转目标迫使你<b>持续追踪位置</b>（视觉搜索 + 注意分配）；② 必须记住「当前该找几」并同步更新（工作记忆）；③ 必须抑制「看到差不多的数字就想点」的冲动（抑制控制）。这种多通路叠加正是它比静态舒尔特方格更「费脑子」的原因。</div>'
    ].join('')
  };

  /* ---------------- 参考文献 ---------------- */
  var refs = [
    { t: 'Diamond A. (2013). Executive Functions. <i>Annual Review of Psychology</i>, 64, 135–168.', d: '执行功能三大核心（抑制控制、工作记忆、认知灵活性）的权威框架综述。本页所有 EF 定义与「执行功能可训练/受睡眠压力影响」的论断均出自此文。doi:10.1146/annurev-psych-113011-143750' },
    { t: 'Miyake A., Friedman N.P., Emerson M.J., Witzki A.H., Howerter A., Wager T.D. (2000). The unity and diversity of executive functions and their contributions to complex "frontal lobe" tasks. <i>Cognitive Psychology</i>, 41(1), 49–100.', d: '用潜变量分析证明执行功能可分离为抑制、更新、切换三个成分的奠基性研究。' },
    { t: 'Giedd J.N. et al. (1999). Brain development during childhood and adolescence: a longitudinal MRI study. <i>Nature Neuroscience</i>, 2(10), 861–863.', d: '145 名被试、243 次扫描的纵向 MRI 研究，发现额叶灰质呈倒 U 型发育曲线，前额叶最晚成熟。' },
    { t: 'Sowell E.R., Thompson P.M., Tessner K.D., Toga A.W. (2001). Mapping continued brain growth and gray matter density reduction in dorsal frontal cortex. <i>Journal of Neuroscience</i>, 21(22), 8819–8829.', d: '定位到背侧额叶（控制执行认知功能的区域）在青春期后仍在持续重塑。' },
    { t: 'Colcombe S., Kramer A.F. (2003). Fitness effects on the cognitive function of older adults: a meta-analytic study. <i>Psychological Science</i>, 14(2), 125–130.', d: '18 项随机试验的荟萃分析，结论：有氧运动对<b>执行功能</b>的改善大于其他认知域。' },
    { t: 'Colcombe S.J. et al. (2006). Aerobic exercise training increases brain volume in aging humans. <i>Journals of Gerontology Series A</i>, 61(11), 1166–1170.', d: '6 个月随机对照试验：有氧组灰质与白质体积显著增加，对照组无变化。' },
    { t: 'Hillman C.H., Erickson K.I., Kramer A.F. (2008). Be smart, exercise your heart: exercise effects on brain and cognition. <i>Nature Reviews Neuroscience</i>, 9(1), 58–65.', d: '有氧运动改善脑与认知（尤其前额叶相关功能）的机制综述。' },
    { t: 'Erickson K.I. et al. (2011). Exercise training increases size of hippocampus and improves memory. <i>PNAS</i>, 108(7), 3017–3022.', d: '有氧运动增加海马体积并改善记忆的经典 RCT。' },
    { t: 'Chen F.-T. et al. (2020). Behavioral and Neurophysiological Aspects of Inhibition — The Effects of Acute Cardiovascular Exercise. <i>Journal of Clinical Medicine</i>, 10(2), 282.', d: '一次急性有氧运动即可改善抑制控制；Stroop 干扰下降与背外侧前额叶（DLPFC）氧合增加相关。' },
    { t: 'World Health Organization (2020). <i>WHO Guidelines on Physical Activity and Sedentary Behaviour</i>. Geneva: WHO.', d: '成人每周至少 150 分钟中等强度（或 75 分钟高强度）有氧活动，每周 ≥2 天肌肉强化活动。' },
    { t: 'Jaeggi S.M., Buschkuehl M., Jonides J., Perrig W.J. (2008). Improving fluid intelligence with training on working memory. <i>PNAS</i>, 105(19), 6829–6833.', d: '双 N-back 训练提升流体智力、存在剂量效应的报告（后续复现存在争议）。' },
    { t: 'Redick T.S. et al. (2013). No evidence of intelligence improvement after working memory training: A randomized, placebo-controlled study. <i>Journal of Experimental Psychology: General</i>, 142(2), 359–379.', d: '含活跃对照组的严格复现，未发现对 17 项认知测量有任何迁移效应。' },
    { t: 'Melby-Lervåg M., Hulme C. (2013). Is working memory training effective? A meta-analytic review. <i>Developmental Psychology</i>, 49(2), 270–291.', d: '荟萃分析：对相似任务（近迁移）有稳定改善，对一般能力（远迁移）无可靠证据。' },
    { t: 'Melby-Lervåg M., Redick T.S., Hulme C. (2016). Working memory training does not improve performance on measures of intelligence or other measures of far transfer. <i>Perspectives on Psychological Science</i>, 11(4), 512–534.', d: '汇总 87 篇文献、145 项对比：对活跃对照组，非言语能力效应量仅 g≈0.05。' },
    { t: 'Klingberg T. et al. (2005). Computerized training of working memory in children with ADHD — a randomized, controlled trial. <i>Journal of the American Academy of Child &amp; Adolescent Psychiatry</i>, 44(2), 177–186.', d: '工作记忆训练改善 ADHD 儿童工作记忆与部分行为指标的 RCT。' },
    { t: 'Ball K., Beard B., Roenker D., Miller R., Griggs D. (1988). Age and visual search: Expanding the useful field of view. <i>Journal of the Optical Society of America A</i>, 5(12), 2210–2219.', d: '「有效视野（UFOV）」训练研究基础：视觉注意广度可通过训练扩展。' },
    { t: 'Van Horn J.D. et al. (2012). Mapping connectivity damage in the case of Phineas Gage. <i>PLoS ONE</i>, 7(5), e37454.', d: '基于盖奇头骨与 CT 数据重建铁棒轨迹，定位左侧眶额皮层及额叶-边缘系统白质通路损伤。' },
    { t: 'Pirau L., Lui F. (2022). Frontal Lobe Syndrome. In <i>StatPearls</i>. Treasure Island (FL): StatPearls Publishing.', d: '额叶综合征的临床综述：眶额/背外侧病变的不同表现、病因与诊断。' },
    { t: 'Heyn P., Abreu B.C., Ottenbacher K.J. (2004). The effects of exercise training on elderly persons with cognitive impairment and dementia: a meta-analysis. <i>Archives of Physical Medicine and Rehabilitation</i>, 85(10), 1694–1704.', d: '30 项随机试验的荟萃分析：运动干预改善认知障碍与痴呆患者的认知与行为，效应量约 0.57。' },
    { t: '舒尔特方格（Schulte Grid）常模参考：中国飞行员 25 格平均用时 ≤6.25 秒（杨利伟 3.04 秒）；7–12 岁 26 秒以内为较高水平、42 秒为中等；18 岁以上成人最好约 12 秒、30 秒偏低。', d: '来源：公开百科条目汇编的实践经验值。需注意：这类数字来自训练实践与人群经验，<b>不是经过严格抽样建立的心理学常模</b>，请仅作参考基线。' }
  ];

  /* ---------------- 自评量表条目 ---------------- */
  /* 4 个维度 × 4 题 = 16 题；Likert 1-5（从不 / 偶尔 / 有时 / 经常 / 几乎总是） */
  var selfcheck = {
    scale: ['从不', '很少', '有时', '经常', '总是'],
    dims: [
      { key: 'inhibit', name: '抑制控制', desc: '克制冲动、抗干扰的能力' },
      { key: 'wm', name: '工作记忆', desc: '在脑中暂存并操作信息的能力' },
      { key: 'flex', name: '认知灵活性', desc: '切换思路、适应变化的能力' },
      { key: 'plan', name: '计划与组织', desc: '拆解目标、按序推进的能力' }
    ],
    items: [
      { d: 'inhibit', q: '话到嘴边会先想一想再说，而不是脱口而出' },
      { d: 'inhibit', q: '能忍住当下想刷手机的冲动，先把手头的事做完' },
      { d: 'inhibit', q: '在嘈杂环境里也能集中注意力做一件事' },
      { d: 'inhibit', q: '情绪上来时能先稳住，而不是立刻发作' },
      { d: 'wm', q: '别人一次说三件事，我能都记住并都办掉' },
      { d: 'wm', q: '心算或推理时，能把中间结果记在脑子里不丢' },
      { d: 'wm', q: '读书读到一段末尾，还记得这段开头在讲什么' },
      { d: 'wm', q: '走进一个房间后，仍然记得自己原本要去拿什么' },
      { d: 'flex', q: '计划被打乱时，我能很快换一条路走' },
      { d: 'flex', q: '从一个任务切换到另一个任务时，不会卡住很久' },
      { d: 'flex', q: '别人指出我错了，我能立刻换个角度重新想' },
      { d: 'flex', q: '遇到新规则、新流程时，上手比较快' },
      { d: 'plan', q: '面对一个复杂任务，我能把它拆成几步来做' },
      { d: 'plan', q: '我做事有先后次序，而不是哪件顺手做哪件' },
      { d: 'plan', q: '我会为将来的事（比如一周后）提前安排' },
      { d: 'plan', q: '能长期坚持一个目标，而不是三天热度' }
    ],
    bands: [
      { max: 34, name: '偏弱区', color: '#e03131', text: '你在多个维度上都报告了较明显的困难。这种情况下的第一优先级不是「刷训练游戏」，而是先排查基础因素：睡眠是否长期不足、是否长期高压、是否有抑郁/焦虑情绪、是否几乎不运动。这些对执行功能的影响远大于任何认知训练。如果这些困难已经影响到工作、学业或人际关系，建议到精神科或神经内科做一次专业评估。' },
      { max: 47, name: '中等偏低', color: '#e8590c', text: '你的执行功能总体处于中等偏下水平，可能在压力大或疲劳时更容易「掉链子」。建议先把有氧运动和睡眠补上，再配合每天 10–15 分钟的分模块训练，坚持 4–8 周后重新自评一次，看趋势。' },
      { max: 63, name: '中等偏上', color: '#3b5bdb', text: '你的执行功能总体不错，属于大多数人的水平。可以针对自己报告得分最低的那个维度做定向训练（例如工作记忆弱就多练 N-back，抑制控制弱就多练 Go/No-Go 与 Stroop）。' },
      { max: 80, name: '良好区', color: '#0ca678', text: '你在各个维度上都报告了较好的执行功能。可以挑战本工具的高难度档位（旋转盘大师级、舒尔特 6×6、N-back 3-back）来保持挑战性，同时注意不要过度训练——收益会递减。' }
    ],
    disclaimer: '本自评改编自执行功能研究常用的自评思路（如 BRIEF 类量表的维度划分），<b>并非标准化心理测量工具，不具备诊断效力</b>。它的唯一作用是帮你定位「哪一块可能偏弱」，从而决定练什么。任何真实的注意力缺陷、冲动控制或情绪调节问题，都需要由精神科医师或临床心理师通过标准化测验与临床访谈来判断。'
  };

  return { pfc: pfc, benefits: benefits, damage: damage, plan: plan, refs: refs, selfcheck: selfcheck };
})();
