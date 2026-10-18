import React from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import App from './App.jsx';
import { seedAssets, validateAsset, searchAssets } from './assets.js';
describe('asset validation and searching', () => {
  it('rejects duplicate IDs regardless of case', () => { expect(validateAsset({...seedAssets[0], id:'pc-002'},seedAssets,'PC-001')).toMatch(/already exists/); });
  it('requires an assignee for assigned computers', () => { expect(validateAsset({...seedAssets[0],assignee:''},seedAssets,'PC-001')).toMatch(/assignee/); });
  it('rejects whitespace-only required fields', () => { expect(validateAsset({...seedAssets[0],name:'  '},seedAssets,'PC-001')).toMatch(/required/); });
  it('combines case-insensitive search with status', () => { expect(searchAssets(seedAssets,'APPLE','Available').map(item=>item.id)).toEqual(['PC-005']); });
});
describe('application workflows', () => {
  it('adds, edits, searches and deletes a computer', async () => {
    const user = userEvent.setup(); render(<App/>);
    await user.click(screen.getByRole('button',{name:/Add computer/}));
    for (const [label,value] of [['Asset ID *','PC-100'],['Computer name *','Test machine'],['Brand *','Dell'],['Location *','Lab']]) await user.type(screen.getByLabelText(label),value);
    await user.click(screen.getByRole('button',{name:'Save computer'}));
    expect(screen.getByText('Test machine')).toBeInTheDocument();
    await user.click(screen.getByRole('button',{name:'Edit PC-100'}));
    await user.clear(screen.getByLabelText('Computer name *')); await user.type(screen.getByLabelText('Computer name *'),'Updated machine');
    await user.click(screen.getByRole('button',{name:'Save computer'}));
    await user.type(screen.getByRole('textbox',{name:'Search computers'}),'updated');
    expect(screen.getByText('Updated machine')).toBeInTheDocument(); expect(screen.queryByText('Mac mini')).not.toBeInTheDocument();
    await user.click(screen.getByRole('button',{name:'Delete PC-100'})); await user.click(screen.getByRole('button',{name:'Confirm delete'}));
    expect(screen.queryByText('Updated machine')).not.toBeInTheDocument(); expect(screen.getByText('No computers found')).toBeInTheDocument();
  });
  it('cancels deletion and filters the collection', async () => {
    const user=userEvent.setup(); render(<App/>);
    await user.click(screen.getByRole('button',{name:'Delete PC-001'})); await user.click(screen.getByRole('button',{name:'Keep computer'}));
    expect(screen.getByText('MacBook Pro 14')).toBeInTheDocument();
    await user.selectOptions(screen.getByRole('combobox',{name:'Filter by status'}),'Maintenance');
    expect(screen.getByText('EliteBook 840')).toBeInTheDocument(); expect(screen.queryByText('Mac mini')).not.toBeInTheDocument();
  });
  it('provides navigation and three team entries', async () => {
    const user=userEvent.setup();render(<App/>);await user.click(screen.getByRole('button',{name:/About/}));
    expect(screen.getByRole('heading',{name:'About this project'})).toBeInTheDocument();expect(screen.getAllByText(/Student ID: pending/)).toHaveLength(3);
    await user.click(within(screen.getByRole('navigation')).getByRole('button',{name:/Computers/}));expect(screen.getByRole('heading',{name:'Computer inventory'})).toBeInTheDocument();
  });
});
