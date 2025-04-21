"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const dotenv_1 = __importDefault(require("dotenv"));
const node_fetch_1 = __importDefault(require("node-fetch"));
// .env読み込み
const envPath = path_1.default.resolve(process.cwd(), '.env');
if (fs_1.default.existsSync(envPath)) {
    dotenv_1.default.config({ path: envPath });
}
const PERPLEXITY_API_KEY = process.env.PERPLEXITY_API_KEY;
const article = `Donald Trump has said the US will "take a pass" on brokering further Russia-Ukraine talks if Moscow or Kyiv "make it very difficult" to reach a peace deal.

The US president told reporters in the Oval Office on Friday that he was not expecting a truce to happen in "a specific number of days" but he wanted it done "quickly".

His comments came hours after US Secretary of State Marco Rubio warned that the US would abandon talks unless there were clear signs of progress within days.

"We're not going to continue with this endeavour for weeks and months on end," Rubio said, adding that the US had "other priorities to focus on".

This comes as Russian strikes on Ukraine continue, with two people reported killed and more than 100 injured in the north-eastern cities of Kharkiv and Sumy on Friday.

Moscow launched a full-scale invasion of Ukraine in 2022, and Russian troops have been advancing - albeit slowly - in eastern Ukraine.

President Vladimir Putin has placed a number of conditions on any potential ceasefire.

Ukraine minerals deal may not buy peace after Trump threat
When asked about a deal between Russian and Ukraine, Trump said: "We're talking about here people dying. We're going to get it stopped, ideally.

"Now if, for some reason, one of the two parties makes it very difficult, we're just going to say, 'You're foolish, you're fools, you're horrible people,' and we're going to just take a pass."

Despite the Trump administration's initial confidence that it could secure a deal quickly, attempts to reach a full ceasefire have yet to materialise, with Washington blaming both sides.

Following a meeting with European leaders in Paris about a potential ceasefire on Thursday, Rubio told reporters on Friday: "We need to determine very quickly now - and I'm talking about a matter of days - whether or not this is doable."

"If it's not going to happen, then we're just going to move on," he said about truce talks.

He admitted that a peace deal would be difficult to strike.

Trump had said before he re-entered office that he would stop the fighting in the first 24 hours of his presidency.

0:35
"It's not our war": US Secretary of State Marco Rubio threatens to move on from Ukraine peace talks
Kremlin spokesman Dmitry Peskov, when asked to respond to Trump saying he expected an answer from Russia on a ceasefire, said "the negotiations taking place are quite difficult".

"The Russian side is striving to reach a peace settlement in this conflict, to ensure its own interests, and is open to dialogue," he said.

During a meeting with Italian Prime Minister Giorgia Meloni in Rome on Friday, US Vice-President JD Vance said he was still "optimistic" about ending the Ukraine war.

"I want to update the prime minister on some of the negotiations between Russia, Ukraine, and also some of the things that have happened even in the past 24 hours," he said.

"I won't prejudge them, but we do feel optimistic that we can hopefully bring this war - this very brutal war - to a close."

EPA Giorgia Meloni, who has blonde shoulder-length hair and wears a lilac suit, walks past Italian soldiers with US President JD Vance, who has short, combed brown hair and wears a navy suit with white shirt and black tie, at Palazzo Chigi in RomeEPA
Vance's comments followed separate news that Ukraine and the US took the first step towards striking a minerals deal, after an initial agreement was derailed when a February meeting between Trump and Ukrainian President Volodymyr Zelensky erupted into a public shouting match.

On Thursday, the two countries signed a memorandum of intent on setting up an investment fund for Ukraine's reconstruction as part of an economic partnership agreement.

The aim is to finalise the deal by 26 April, the memo published by the Ukrainian government says.

The details of any deal remain unclear. Previous leaks have suggested the agreement has been extended beyond minerals to control of Ukraine's energy infrastructure, as well as its oil and gas.

Ukrainian negotiators have tried to resist Trump's demands that a joint investment fund would pay back the US for previous military aid, but have seemingly accepted his claim that it would help the country recover after the war ends.

The memo said the "American people desire to invest alongside the Ukrainian people in a free, sovereign and secure Ukraine".

Zelensky had been hoping to use the deal to secure a US security guarantee in the event of a ceasefire deal, telling European leaders last month that "a ceasefire without security guarantees is dangerous for Ukraine".

The US has so far resisted providing Kyiv with security guarantees.

The White House argues the mere presence of US businesses would put off Russia from further aggression, but that did not exactly work when they invaded in 2022.

Reuters Rescue at the site of a bombed-out shell of white three-storey building which housed a bakery in Sumy, Ukraine. Reuters
A bakery was hit during a recent Russian strike on Sumy
Economy Minister Yulia Svyrydenko announced the signing of the memorandum on X, with pictures of Svyrydenko and US Treasury Secretary Scott Bessent separately signing the document over an online call.

"There is a lot to do, but the current pace and significant progress give reason to expect that the document will be very beneficial for both countries," Svyrydenko wrote.

Bessent said the details were still being worked out but the deal is "substantially what we'd agreed on previously."

Trump hinted at the deal during a press conference with Meloni, saying "we have a minerals deal which I guess is going to be signed on (next) Thursday... and I assume they're going to live up to the deal. So we'll see. But we have a deal on that".

Ivanna Klympush-Tsintsadze, an MP and the chair of Ukraine's parliamentary committee on EU Integration, told the BBC the Ukrainian parliament would have "the last word" in the deal.

She added: "I hope that there will be enough reasoning to ensure that whatever is signed, and if it is going to be ratified that it is in the interest of our country and our people".

On Thursday, Ukrainian Foreign Minister Andrii Sybiha met Rubio and Trump's special envoy Steve Witkoff in Paris to discuss how to end the war.

Sybiha said they had "discussed the paths to a fair and lasting peace, including full ceasefire, multinational contingent, and security guarantees for Ukraine".`;
const summaryAnswer = `Trump says US will 'pass' on Ukraine peace talks if no progress soon`;
function buildSummaryPrompt(article, answer) {
    return `#Order\nYou are an English teacher. Please evaluate the following student's answer to the question below, based on the article provided.\n\n#Task\n- Score the answer out of 15 points.\n- Point out any mistakes and provide corrections.\n- Give advice on how to improve the answer.\n- Provide a model answer.\n- All output should be in English.\n- Output format (JSON parsable):\n{\n  "score": 12,\n  "mistakes": "The summary missed the main point about ...",\n  "advice": "Try to include ...",\n  "correction": "Your summary should be ...",\n  "model_answer": "This article is about ..."\n}\n\n#Input\nArticle: ${article}\nQuestion: Summarize the article.\nStudent answer: ${answer}`;
}
async function askAI(prompt) {
    const res = await (0, node_fetch_1.default)('https://api.perplexity.ai/chat/completions', {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${PERPLEXITY_API_KEY}`,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            model: 'sonar',
            messages: [{ role: 'user', content: prompt }],
        }),
    });
    const data = await res.json();
    // Perplexityのchoices[0].message.contentのみ返す
    return data.choices?.[0]?.message?.content || 'No response';
}
(async () => {
    const prompt = buildSummaryPrompt(article, summaryAnswer);
    console.log('--- AI評価プロンプト ---\n', prompt);
    const aiResponse = await askAI(prompt);
    console.log('--- AI生応答 ---\n', aiResponse);
    // JSON部分だけ抽出してパース
    try {
        const match = aiResponse.match(/\{[\s\S]*\}/);
        const jsonStr = match ? match[0] : aiResponse;
        const parsed = JSON.parse(jsonStr);
        console.log('--- パース結果 ---');
        console.log(parsed);
    }
    catch (e) {
        console.error('AI応答のパースに失敗:', aiResponse);
    }
})();
