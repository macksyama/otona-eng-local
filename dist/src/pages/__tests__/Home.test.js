"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const jsx_runtime_1 = require("react/jsx-runtime");
const react_1 = require("@testing-library/react");
const Home_1 = __importDefault(require("../Home"));
describe('Home', () => {
    it('記事入力欄とボタンが表示される', () => {
        (0, react_1.render)((0, jsx_runtime_1.jsx)(Home_1.default, { setPage: () => { }, setArticle: () => { } }));
        expect(react_1.screen.getByText('記事を入力してください')).toBeInTheDocument();
        expect(react_1.screen.getByPlaceholderText('ここにBBCニュース記事を貼り付けてください')).toBeInTheDocument();
        expect(react_1.screen.getByText('レッスン開始')).toBeInTheDocument();
    });
    it('記事を入力しないとボタンが無効', () => {
        (0, react_1.render)((0, jsx_runtime_1.jsx)(Home_1.default, { setPage: () => { }, setArticle: () => { } }));
        expect(react_1.screen.getByText('レッスン開始')).toBeDisabled();
    });
    it('記事を入力するとボタンが有効', () => {
        (0, react_1.render)((0, jsx_runtime_1.jsx)(Home_1.default, { setPage: () => { }, setArticle: () => { } }));
        react_1.fireEvent.change(react_1.screen.getByPlaceholderText('ここにBBCニュース記事を貼り付けてください'), { target: { value: 'test' } });
        expect(react_1.screen.getByText('レッスン開始')).not.toBeDisabled();
    });
});
