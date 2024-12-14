// Generated by ./src/Harmonic_Entropy.ipynb in `research` branch

// σ = 13.
// metric = "sqrt"
// N = 10000
// series = "Tenney"
// entropyType = "min"
// C = 0:1.0:1200

export const HE_arr = [
0.4292512170369902,
0.432486601929962,
0.4422039572165927, 
0.458435979059663, 
0.4812341950039464, 
0.510664699262046, 
0.5468025483284634, 
0.589725174172094, 
0.6395052547194374, 
0.6962035398063542, 
0.7598621542492267, 
0.8304988790025051, 
0.9081028422449366, 
0.9926319376580567, 
1.0840121381925878, 
1.1821387081099402, 
1.2868791554314747, 
1.3980776317388375, 
1.5155603922115397, 
1.6391418837843177, 
1.7686310327733354, 
1.9038373474250974, 
2.0445765231404835, 
2.1906753246550394, 
2.3419756074369014, 
2.498337420188502, 
2.6596411955036325, 
2.825789083879678, 
2.9967055176833424, 
3.172337108460536, 
3.3526519862721575, 
3.537638686861409, 
3.727304684483663, 
3.921674657687281, 
4.120788564115242, 
4.324699589772958, 
4.5145745934896935, 
4.487630760211107, 
4.460241574442323, 
4.432524382896077, 
4.404647270523595, 
4.376839349931594, 
4.3494041114287185,
4.321313806689057,
4.292692713627664,
4.265003670153789, 
4.2383433236815575, 
4.209575626772701, 
4.182687828182631,
4.15620801132556,
4.128637540117097,
4.104546681424012,
4.07646743048732,
4.0526824572400315,
4.025960188472652,
4.003011388072312,
3.976988012474198,
3.955695039155715,
3.929606579452963,
3.9095865088093564,
3.8841756265116536,
3.863224150880754,
3.841512506881464,
3.818646862247525,
3.801856338119244,
3.7772105785029533,
3.757409121161674,
3.7411698598237546,
3.7171265156474096,
3.6991674808069965,
3.6843471496604403,
3.660763736793803,
3.643271270630475,
3.631871067792485,
3.608615174191195,
3.590016792079664,
3.5775088406902436,
3.562610296626117,
3.541085020614066,
3.525636047110087,
3.516255489847008,
3.500211020508458,
3.479682015443502,
3.465188666922967,
3.45671748538951,
3.4461100188538003,
3.4239972376361205,
3.4078617435637524,
3.3976881361906335,
3.3934613620022005,
3.376638838483156,
3.355847622870482,
3.340963603581827,
3.33197646899238,
3.3288778077843113,
3.3165432607090994,
3.293538733769397,
3.276410600902758,
3.265159511494562,
3.2597884394065972,
3.2603025774292855,
3.2417276255503067,
3.2185279427873406,
3.201240390714063,
3.1898767985330845,
3.184449853644825,
3.1849727160267776,
3.1827371365734165,
3.1551050488560155,
3.1334611033223236,
3.1178164167806015,
3.1081807027526307,
3.104561992746198,
3.1069664144851523,
3.1153980343586722,
3.0898802006031523,
3.0647394858232535,
3.045625271031802,
3.0325331988516373,
3.025457100434485,
3.0243892299258173,
3.0293205414202413,
3.040240996730423,
3.031204214713672,
3.00167147778154,
2.978095092787648,
2.960464308102448,
2.9487689472040954,
2.9429996499608526,
2.943148070529268,
2.9492070274526907,
2.9611706036587333,
2.979034196097545,
2.9521926875289246,
2.9210523563415554,
2.8958059030406353,
2.8764535601380614,
2.8629964767887923,
2.855436549308976,
2.853776238038715,
2.8580183779983805,
2.868165990593173,
2.884222103244489,
2.906189583294965,
2.893723049763551,
2.856133552437791,
2.8244617308761946,
2.798708618097825,
2.7788746395417365,
2.7649596204220974,
2.7569628267392674,
2.7548830379156835,
2.7587186476367296,
2.7684677881230946,
2.784128471813688,
2.805698743380118,
2.8331768342143446,
2.845165767497765,
2.7994428270980847,
2.7596249294395836,
2.725712361760323,
2.6977061296717926,
2.675607971477507,
2.659420335106738,
2.6491463194421896,
2.6447895843557903,
2.6463542360895147,
2.6538446965083233,
2.6672655660037417,
2.6866214902700447,
2.7119170406998125,
2.743156616718898,
2.7803443760603344,
2.7956264813758827,
2.741766425337422,
2.693865334088456,
2.6519262872934593,
2.6159521704194333,
2.5859457112242508,
2.561909496613091,
2.543845956738847,
2.5317573053981004,
2.525645429434803,
2.525511724806006,
2.5313568828414,
2.543180636570863,
2.5609814832417985,
2.5847564046968796,
2.6145006115395355,
2.650207339455324,
2.691867726284573,
2.7394707962323857,
2.7930035729399485,
2.7608405701204943,
2.698931111003106,
2.6429037383019978,
2.592741507717007,
2.548428162979425,
2.5099489973175024,
2.477291744276418,
2.4504474496370725,
2.4294112728478034,
2.414183165821005,
2.404768379279741,
2.4011777520780253,
2.403427746970613,
2.411540206984825,
2.425541819553349,
2.4454632904811207,
2.4713382460626607,
2.503201898477814,
2.5410895260211923,
2.5850348346421606,
2.635068279460641,
2.691215433155602,
2.753495491323669,
2.8219200023147617,
2.858281055271222,
2.777668074379233,
2.703180522627163,
2.634793569470658,
2.57247391325741,
2.5161808676182718,
2.465867805351382,
2.4214838935044445,
2.3829760403986318,
2.3502909678492845,
2.3233773197170096,
2.3021877205567685,
2.286680704561499,
2.2768224440944356,
2.2725882177566743,
2.273963569189628,
2.2809451189701235,
2.2935410026278,
2.311770917908235,
2.3356657740809617,
2.365266945682378,
2.4006251429955245,
2.441798922171435,
2.4888528694141616,
2.5418555060661143,
2.6008769744123805,
2.665986576899402,
2.737250253240132,
2.814728089319895,
2.8809460772507367,
2.872968163444516,
2.8713272038720543,
2.8760390603168893,
2.887105157022622,
2.8506486313025357,
2.761173955628326,
2.6779700258739894,
2.6009820292137538,
2.530144008108953,
2.465380859257429,
2.4066106075703475,
2.3537468591460087,
2.306701337071669,
2.2653864091365743,
2.22971752596447,
2.199615500257631,
2.1750085713766545,
2.1558342131171235,
2.1420406553149696,
2.1335881011685807,
2.130449631580095,
2.1326117953455843,
2.140074889839139,
2.1528529412626867,
2.1709733969722156,
2.1944765452540715,
2.2234146805813446,
2.257851035113494,
2.2978585001800265,
2.34351816474662,
2.394917701300611,
2.4521496329911567,
2.515309518902729,
2.5844940966620054,
2.659799422812201,
2.741319051230083,
2.7861467439306886,
2.7481746844035047,
2.7166657119297026,
2.6916871833358598,
2.6732966191079033,
2.6615407594664515,
2.6564548217230617,
2.6580619592252908,
2.666372918542182,
2.6813858893718554,
2.7030865408624907,
2.7314482383108665,
2.766432435069921,
2.8079892354189613,
2.8560581246089463,
2.8218930899155277,
2.726366950489636,
2.637117349431509,
2.554051752678098,
2.477072941428564,
2.4060805676076145,
2.340972783347446,
2.2816479154939575,
2.2280061534469042,
2.1799512171283077,
2.1373919715947025,
2.1002439556926533,
2.0684307940290965,
2.0418854641542605,
2.0205513939847486,
2.0043833679012,
1.9933482234672473,
1.9874253242375353,
1.9866067976375932,
1.9908975304685763,
2.0003149183365982,
2.0148883693846127,
2.034658567271624,
2.059676503522123,
2.090002295210053,
2.125703810394855,
2.1668551306125856,
2.2135348867241285,
2.265824511083905,
2.3238064547608577,
2.3875624228091907,
2.45717168275478,
2.5327095010357006,
2.614245758791147,
2.701843792057693,
2.795559492319093,
2.895440691971748,
2.932081267828416,
2.8695792227485413,
2.800191943891754,
2.7370788649205613,
2.680248358350324,
2.629702792930097,
2.5854395635458127,
2.5474522013061485,
2.515731517714987,
2.490266740428321,
2.471046603065643,
2.4580603572262607,
2.451298680632794,
2.4507544606866807,
2.456423437329807,
2.468304692794209,
2.486400978593924,
2.5107188721321623,
2.5412687568516157,
2.578064621321894,
2.621123674453267,
2.6704657765597317,
2.726112689616855,
2.788087155009431,
2.830719339620143,
2.8340285473241584,
2.843727959912849,
2.859832243010072,
2.882350638684678,
2.9112856031279417,
2.946631544382532,
2.912253668290234,
2.8015426127938095,
2.6971676469910957,
2.599082491406486,
2.507230051662167,
2.4215428681531024,
2.3419439322848037,
2.2683478487602913,
2.2006623070973457,
2.138789811882197,
2.0826296111248928,
2.0320797559653365,
1.9870392229418508,
1.9474100317342509,
1.913099296083127,
1.884021152631425,
1.8600985208374694,
1.8412646560255375,
1.8274644663640855,
1.818655572577807,
1.814809096205897,
1.8159101681200907,
1.8219581538960206,
1.8329665967117337,
1.8489628820380468,
1.8699876318345174,
1.8960938396064888,
1.9273457617867622,
1.963817585651306,
2.0055918993972424,
2.052757995979691,
2.1054100485323923,
2.163645201241608,
2.2275616248387795,
2.297256589794607,
2.372824612214662,
2.454355726828969,
2.5419339379915806,
2.6356358931720667,
2.735529814238379,
2.8416747104127915,
2.9541198839062437,
2.96956925441416,
2.9101419535769697,
2.857103902977135,
2.810466145409693,
2.770231439667797,
2.736395090984543,
2.7089458633551233,
2.6878669317734802,
2.6731368372918256,
2.664730414154322,
2.6626196653555536,
2.6667745701617407,
2.677163813843812,
2.693755435684002,
2.7163988790438696,
2.641298773021657,
2.572306578455678,
2.509392683071054,
2.452528959914451,
2.401689016711733,
2.3568484006657155,
2.3179847626953336,
2.2850779837502806,
2.258110264631512,
2.237066179834972,
2.22193269539422,
2.212699150563252,
2.209357203449646,
2.2119007413420952,
2.2203257574102815,
2.23463019660429,
2.254813774848703,
2.280877776911622,
2.312824839531536,
2.350658727413421,
2.3943841104811345,
2.4440063512347185,
2.4995313111673103,
2.5609651849271846,
2.628314370267175,
2.6844732705195797,
2.6504783028320853,
2.622418433383081,
2.600300504687321,
2.5841316441022446,
2.573919441940331,
2.569672179258811,
2.5713990990947586,
2.5791107125804715,
2.5928191289889657,
2.612538396331192,
2.6382848366761467,
2.6700773579371684,
2.707937721543836,
2.7518907433288016,
2.8019644032894915,
2.8407115162048355,
2.84268618844271,
2.850883623518162,
2.865342855200711,
2.8861044054704545,
2.9132093676022923,
2.9466982776275588,
2.9866097864731667,
3.0329791586133834,
3.085836637678926,
3.114249620404548,
2.99500444515173,
2.868513187982555,
2.7485468957059456,
2.6350860528188766,
2.528097352571323,
2.4275331584687656,
2.3333314116524844,
2.2454160146568922,
2.163697697169654,
2.088075343922042,
2.018437740978038,
1.95466567649972,
1.896634317073414,
1.8442157717452008,
1.7972817531686385,
1.7557062481781607,
1.7193681176183058,
1.6881535560184922,
1.6619583542429461,
1.64068992119317,
1.6242690328546843,
1.6126312876340474,
1.6057282555435803,
1.6035283152058732,
1.6060171769986133,
1.613198093296882,
1.6250917582072528,
1.641735900031495,
1.6631845705858066,
1.6895071370484291,
1.7207869847493182,
1.7571199436526779,
1.7986124574337925,
1.8453795219997333,
1.8975424297632708,
1.9552263663778973,
2.018557917133804,
2.0876625497352252,
2.1626621475425867,
2.2436726713987705,
2.3308020278792974,
2.4241482165721946,
2.5237978186551855,
2.6298248740171464,
2.7422901754596323,
2.861240987582384,
2.986711176576335,
3.102559059047166,
3.0598046044135048,
3.0235973733209307,
2.993925648931171,
2.970769451397565,
2.9541019968594724,
2.9407494721550473,
2.88806168657793,
2.84175555440935,
2.8017906776561077,
2.768126069202524,
2.740720974683899,
2.7195355370282375,
2.7045313132999214,
2.6956716584094593,
2.692921993253046,
2.69624997615662,
2.7056255964303295,
2.7210212077229996,
2.694567809224769,
2.636916994851426,
2.5852171656784755,
2.539449767913761,
2.499598348033387,
2.465648474910344,
2.437587663760493,
2.4154053028134297,
2.3990925824542817,
2.3886424257309913,
2.384049418557277,
2.3853097376359838,
2.3924210740500644,
2.4053825505876225,
2.424194631152084,
2.448859021027861,
2.479378557294949,
2.5157570892813346,
2.5579993495775084,
2.6061108167791014,
2.6600975717373205,
2.719966149647752,
2.7857233907629135,
2.8573762928421806,
2.8274232574470317,
2.7263070381043644,
2.631107037551968,
2.541829556832281,
2.4584804543997865,
2.381065072108033,
2.3095881800923723,
2.2440539405618454,
2.1844658896856264,
2.130826935978106,
2.083139372905153,
2.0414049029001102,
2.005624669630012,
1.9757992952161259,
1.9519289191987945,
1.9340132363388673,
1.9220515308445731,
1.9160427052663533,
1.9159853030635128,
1.9218775246575448,
1.9337172375856677,
1.9515019820933603,
1.975228974101245,
2.004895107904643,
2.0404969611825994,
2.0820308048927507,
2.129492620412297,
2.1828781258738976,
2.242182813074106,
2.3074019956484584,
2.3785308684666595,
2.4555645774610952,
2.5384982984175535,
2.6273273226764715,
2.722047147253321,
2.8226535666108137,
2.8111281743773073,
2.80226475768339,
2.799277986594944,
2.8021656978335474,
2.725661280044721,
2.6545700025969303,
2.5893510079104685,
2.530005106679267,
2.4765339030857,
2.428939785815034,
2.3872259043615616,
2.351396130705468,
2.3214550064971053,
2.2974076759382744,
2.279259804634266,
2.2670174848405673,
2.260687127773369,
2.260275344011935,
2.2657888134981645,
2.2772341472222974,
2.294617743344347,
2.3179456411929173,
2.3472233772474396,
2.3824558477788362,
2.4236471832268793,
2.470800639564182,
2.5239185117826968,
2.583002074203031,
2.6480515515377925,
2.6422914480890225,
2.6060748950071173,
2.5758188552498757,
2.5515197503853857,
2.533173317188431,
2.5207747700937,
2.5143189819794394,
2.513800675843311,
2.5192146192976312,
2.5305558136394,
2.547819669570412,
2.5710021624518404,
2.6000999612427376,
2.6351105269313218,
2.6760321782356065,
2.722864124521079,
2.7406050781604505,
2.7278718226083294,
2.721051733116676,
2.7201473776617804,
2.725162038318875,
2.7360996633932,
2.7529648393030377,
2.775762792947432,
2.8044994344599594,
2.8391814487965785,
2.8798164425441155,
2.8911672415298457,
2.8946038554960287,
2.9040241507607782,
2.9194420540010246,
2.9408739860591835,
2.9683392919555605,
3.0018606710847666,
3.0414645816010997,
3.05324962934378,
3.0692337537737253,
3.091405322120532,
3.119808202916041,
3.1544904626055956,
3.1950975756150273,
3.215143019420208,
3.2416308159905047,
3.274617926215625,
3.314160040438878,
3.2208925303635443,
3.0708385515509753,
2.927477977810075,
2.790839498547216,
2.6609390297584974,
2.5377774663028867,
2.4213387388706242,
2.3115883028959616,
2.2084721705776915,
2.1119165709118963,
2.0218282882158514,
1.9380956901981707,
1.8605904161095037,
1.7891696579445324,
1.7236789366539411,
1.6639552534816109,
1.6098304851883798,
1.5611348910117915,
1.5177006074882602,
1.4793650226069204,
1.4459739405975198,
1.4173844703595966,
1.3934675917873673,
1.3741103732112443,
1.3592178286431151,
1.3487144148586094,
1.3425451754816582,
1.3406765424777087,
1.3430968054355417,
1.3498162565435294,
1.3608670151779043,
1.3763025315045632,
1.3961967644469186,
1.4206430267560402,
1.4497524896306817,
1.483652342143437,
1.5224836072060453,
1.566398626232491,
1.6155582389218524,
1.6701287020872304,
1.7302784110594869,
1.7961745072076192,
1.8679794734021422,
1.9458478334115263,
2.02992307891836,
2.1203349471383532,
2.2171971617741506,
2.320605730175024,
2.430637861272713,
2.5473515344643585,
2.6707857123481467,
2.8009611537529215,
2.937881751394501,
3.0815362936593726,
3.231900534354054,
3.3035904503908693,
3.2683419098745174,
3.2396749095252946,
3.217535778789376,
3.177381450710515,
3.14189748253527,
3.1127745473244923,
3.089959857145168,
3.0734037201543964,
3.0548808481111016,
3.016504281767626,
2.984260742253185,
2.9581168523555377,
2.9380433684005847,
2.924014946017882,
2.9160098319927994,
2.9140095088262354,
2.8791949455799393,
2.8427016152340125,
2.8121731362827633,
2.7876001722168713,
2.7689748259570495,
2.7562903679658897,
2.7495410096935,
2.748721723997208,
2.753828111942835,
2.764856313420755,
2.736327237167136,
2.6924531082730647,
2.654492110109981,
2.6224423445279945,
2.5963024721010237,
2.5760717597407368,
2.5617501253753563,
2.55333817305145,
2.550837212775967,
2.5542492605919405,
2.5635770157115894,
2.5788238129475354,
2.5999935501179117,
2.627090591488256,
2.660119649591664,
2.6300616417194536,
2.5709687923794746,
2.517822759665595,
2.4706281735755855,
2.4293892452133052,
2.3941096150561436,
2.364792214452705,
2.3414391450746157,
2.324051580339487,
2.3126296919771585,
2.307172603971108,
2.3076783751158523,
2.3141440104333064,
2.326565500727913,
2.344937888669663,
2.36925535900788,
2.3995113498624545,
2.4356986815312496,
2.477809698903105,
2.5258364233776947,
2.5797707101615277,
2.6396044069215,
2.7053295100156296,
2.776938314861977,
2.8544235574249233,
2.811354384451125,
2.7159917469068664,
2.6264876296453483,
2.5428376888034183,
2.4650385226304987,
2.3930877224203795,
2.326983905976923,
2.266726733697813,
2.212316907501729,
2.16375615291557,
2.121047184696512,
2.084193656408375,
2.053200094424194,
2.0280718169070093,
2.0088148384463063,
1.9954357612110267,
1.9879416537286294,
1.9863399187131792,
1.9906381517363874,
2.0008439929489885,
2.0169649744943103,
2.039008366684338,
2.0669810264003394,
2.1008892515027306,
2.140738645256462,
2.1865339948697504,
2.2382791681813865,
2.2959770322979813,
2.3596293975687828,
2.4292369896928587,
2.5047994519925574,
2.5863153789789624,
2.6737823813098727,
2.7671971811368685,
2.726002733352899,
2.6724756756651966,
2.6248826074372964,
2.583218160042251,
2.547476896432296,
2.5176535079434985,
2.4937430069726894,
2.4757409085720283,
2.46364339424963,
2.4574474517988723,
2.457150985794122,
2.4627528944626182,
2.4742531099331533,
2.491652600320732,
2.5149533336695633,
2.5441582053716996,
2.579270932226213,
2.620295917722118,
2.6672380943377343,
2.7201027495777663,
2.778895343058152,
2.7772043282103756,
2.776481981585695,
2.781703177447682,
2.792872312121514,
2.8099931537659457,
2.833068744259195,
2.862101328886736,
2.8970923138962257,
2.938042250556027,
2.9849508431385505,
2.964876314070443,
2.8357297370526537,
2.712536208469967,
2.5952924712799406,
2.4839946858739133,
2.3786385012216935,
2.279219125904749,
2.1857313982181825,
2.098169855486489,
2.0165288035544187,
1.9408023879951013,
1.870984668860123,
1.807069700747478,
1.7490516195834926,
1.6969247368369584,
1.6506836409707095,
1.6103233048745158,
1.5758391969160208,
1.5472273922025352,
1.5244846797712912,
1.507608660811923,
1.4965978327440443,
1.491451654069387,
1.492170585405783,
1.4987561029711778,
1.511210681971576,
1.5295377487826523,
1.553741602405657,
1.5838273073160942,
1.6198005613954745,
1.6616675440328887,
1.7094347506066625,
1.7631088203282494,
1.8226963647969994,
1.8882038045501044,
1.9596372204020143,
2.037002225486491,
2.1203038627035893,
2.2095465308161595,
2.3047339408337435,
2.4058691026710872,
2.512954340478064,
2.6259913336033405,
2.744981178956337,
2.869924469631667,
3.0006452953174096,
2.9810958829769807,
2.967499581647653,
2.9188549318261994,
2.870705171323666,
2.828506844120515,
2.792259399946193,
2.7619623477488555,
2.737615259622467,
2.719217755948286,
2.7067694734909593,
2.7002700190705093,
2.699718912144115,
2.70511552015386,
2.7164589908163945,
2.714329951975508,
2.6518391322148647,
2.5952906662314836,
2.54468223162005,
2.5000110451411035,
2.461273857559723,
2.4284669677859143,
2.4015862568353,
2.3806272412443583,
2.3655851446995824,
2.356454985808298,
2.3532316791828207,
2.355910146359746,
2.3644854325598934,
2.3789528249354777,
2.399307967768248,
2.4255469700887087,
2.457666501388291,
2.495663871492331,
2.5395370912422663,
2.5892849113824385,
2.644906837933181,
2.706403123321915,
2.7737747335945677,
2.8127756371502786,
2.8145898656429575,
2.822285948280213,
2.8358669683874673,
2.855336281823903,
2.747453906731276,
2.644800133228165,
2.5480452092895876,
2.4571924630079205,
2.372244979591979,
2.29320553714545,
2.2200765612880367,
2.1528600989597377,
2.0915578105716124,
2.0361709785751327,
1.9867005295954772,
1.9431470665802537,
1.9055109070067058,
1.8737921230994241,
1.8479905802453018,
1.8281059703363303,
1.8141378375830215,
1.8060855953591923,
1.8039485337827599,
1.8077258189157026,
1.8174164855832742,
1.833019426774549,
1.8545333833096764,
1.8819569378768812,
1.9152885176093093,
1.9545264090693324,
1.999668788845071,
2.0507137719774637,
2.10765947918853,
2.170504122455807,
2.2392461069725345,
2.3138841460541695,
2.3944173842054846,
2.4808455224478885,
2.573168939208554,
2.6713887996565857,
2.7755071463781027,
2.810255055478397,
2.7648543208256116,
2.7253639580899756,
2.6917898407663006,
2.664138698157156,
2.6424179967358006,
2.626635785467472,
2.6168005098510516,
2.6129208011635643,
2.6150052488066455,
2.6230621646756087,
2.6370993490280425,
2.6571238673768307,
2.683141847460436,
2.7151583043730056,
2.6606651919111397,
2.5774323852534926,
2.5002052259681538,
2.42898328775901,
2.363764747008649,
2.304546449193898,
2.251324009050308,
2.204091938223748,
2.162843793305393,
2.127572336788549,
2.0982697036102897,
2.074927566510762,
2.057537294389969,
2.046090099072831,
2.040577167298719,
2.040989776214406,
2.04731939205427,
2.059557752933947,
2.0776969376769743,
2.1017294232759087,
2.1316481339254216,
2.1674464845501,
2.209118421408259,
2.2566584617351992,
2.310061733566665,
2.36932401594261,
2.4344417787271637,
2.5054122203875533,
2.582233301339375,
2.6649037699604494,
2.7534231781524703,
2.8477918834167015,
2.8453717342092055,
2.771825960449061,
2.6957840731146945,
2.6256004118412664,
2.5612787813177817,
2.50282343282611,
2.450238948982398,
2.4035301209674764,
2.362701823230118,
2.327758890946859,
2.29870600547382,
2.275547592626116,
2.2582877378932658,
2.2469301216947444,
2.241477976571025,
2.2419340668811563,
2.248300690236226,
2.260579698638373,
2.278772536209599,
2.3028802895612444,
2.332903746330743,
2.3688434572290635,
2.4106997971048836,
2.4584730210176797,
2.5121633120744016,
2.5717708187556436,
2.637295680554801,
2.675342815719138,
2.6205204989537365,
2.571615989452217,
2.528629433489106,
2.491560954031797,
2.460410636781404,
2.435178519819139,
2.4158645895779043,
2.4024687851630486,
2.3949910121561016,
2.3934311660245826,
2.3977891642127345,
2.4080649849882305,
2.4242587102508852,
2.4463705688437436,
2.474400976502302,
2.508350568472478,
2.5482202210391636,
2.594011058728721,
2.6457244447523878,
2.6441719781479818,
2.609706002567803,
2.5811677293161415,
2.558559022566539,
2.5418816805671134,
2.5311373396591734,
2.5263273771368477,
2.527452818859937,
2.5345142576544797,
2.547511788279465,
2.5664449641047216,
2.5913127796591113,
2.6221136819177766,
2.658845611670562,
2.7015060746354598,
2.6944350974820823,
2.673342187633442,
2.658168819877815,
2.6489119588693275,
2.6455688080677517,
2.6481369637159764,
2.6566145567016917,
2.671000374243081,
2.691293954081699,
2.7174956450386496,
2.749606629345467,
2.783108908135767,
2.7669630088748365,
2.756734557722299,
2.752427478892271,
2.754046048151784,
2.761594703789608,
2.7750778444141666,
2.794499623911531,
2.819863754388851,
2.851173327821136,
2.855626825373694,
2.849935956714158,
2.8501947830490915,
2.8564028242718678,
2.868558661195798,
2.8866600157974682,
2.9107038771348797,
2.940686666581106,
2.939469251411646,
2.9407475861086607,
2.9479527563020747,
2.9610810168377326,
2.980129120249536,
3.00509449697974,
3.022244149658676,
3.024836088454237,
3.0333428808885485,
3.047765655466264,
3.0681064680903773,
3.094368204856118,
3.1018243770672225,
3.1107124052251094,
3.125533444196623,
3.1462920186091035,
3.1718209351635536,
3.1792049253835013,
3.1925386406925496,
3.2118251083662464,
3.2370666439308904,
3.249458366916446,
3.264560202664552,
3.28561971954388,
3.309668185965545,
3.3232222161620757,
3.3427328863609613,
3.3682004126842364,
3.384798868961275,
3.4049543102295283,
3.4310760756418675,
3.449189644965988,
3.4718802141419665,
3.497207789745265,
3.518095931603401,
3.5450411212135946,
3.5677951196506412,
3.594475480264747,
3.620404276975016,
3.648192546143433,
3.676284342743531,
3.7064818269236484,
3.5399657241421068,
3.358154102531849,
3.1830757294398113,
3.014844405277039,
2.8535742012032923,
2.6993752887950007,
2.552349130025566,
2.412583202063723,
2.280145505600742,
2.155079168967108,
2.0373975020912845,
1.9270798644052871,
1.8240686826110315,
1.7282678868175214,
1.6395429325742399,
1.5577224535848877,
1.482601461431535,
1.4139458916295125,
1.3514982046279946,
1.2949836957547127,
1.2441171528494004,
1.1986095213553543,
1.1581742859905717,
1.1225333452140214,
1.0914222286177468,
1.0645945786760385,
1.0418258800890716,
1.0229164682546925,
1.0076938817580872,
0.9960146427224255,
0.9877655551992192,
0.9828646078745017,
0.9812615557065869]