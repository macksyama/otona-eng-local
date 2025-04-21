/// <reference types="@testing-library/jest-dom" />
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import Home from '../Home';

describe('Home', () => {
  it('記事入力欄とボタンが表示される', () => {
    render(<Home setPage={() => {}} setArticle={() => {}} />);
    expect(screen.getByText('記事を入力してください')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('ここにBBCニュース記事を貼り付けてください')).toBeInTheDocument();
    expect(screen.getByText('レッスン開始')).toBeInTheDocument();
  });

  it('記事を入力しないとボタンが無効', () => {
    render(<Home setPage={() => {}} setArticle={() => {}} />);
    expect(screen.getByText('レッスン開始')).toBeDisabled();
  });

  it('記事を入力するとボタンが有効', () => {
    render(<Home setPage={() => {}} setArticle={() => {}} />);
    fireEvent.change(screen.getByPlaceholderText('ここにBBCニュース記事を貼り付けてください'), { target: { value: 'test' } });
    expect(screen.getByText('レッスン開始')).not.toBeDisabled();
  });
}); 