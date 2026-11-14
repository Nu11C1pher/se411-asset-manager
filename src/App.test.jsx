import React from 'react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, within, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import App from './App.jsx';
import { seedAssets, validateAsset, searchAssets } from './assets.js';
describe('asset validation and searching', () => {
  it('rejects duplicate IDs regardless of case', () => { expect(validateAsset({...seedAssets[0], id:'pc-002'},seedAssets,'PC-001')).toMatch(/already exists/); });
  it('requires an assignee for assigned computers', () => { expect(validateAsset({...seedAssets[0],assignee:''},seedAssets,'PC-001')).toMatch(/assignee/); });
  it('rejects whitespace-only required fields', () => { expect(validateAsset({...seedAssets[0],name:'  '},seedAssets,'PC-001')).toMatch(/required/); });
  it('combines case-insensitive search with status', () => { expect(searchAssets(seedAssets,'APPLE','Available').map(item=>item.id)).toEqual(['PC-005']); });
});
let rows;
beforeEach(() => {
 rows=seedAssets.map(a=>({...a}));
 vi.stubGlobal('fetch',vi.fn(async (url,options={})=>{
  const u=new URL(url,'http://localhost'); const id=decodeURIComponent(u.pathname.split('/')[3]||'');
  let value; let code=200;
  if(options.method==='POST') { value=JSON.parse(options.body); rows.push(value); code=201; }
  else if(options.method==='PUT') { value=JSON.parse(options.body); rows=rows.map(a=>a.id===id?value:a); }
  else if(options.method==='DELETE') { rows=rows.filter(a=>a.id!==id); code=204; }
  else if(id) { value=rows.find(a=>a.id===id); if(!value) {code=404;value={message:'Computer not found.'};} }
  else { const filtered=searchAssets(rows,u.searchParams.get('query')||'',u.searchParams.get('status')||'All');const page=Number(u.searchParams.get('page')||0);value={content:filtered.slice(page*5,page*5+5),number:page,size:5,totalElements:filtered.length,totalPages:Math.ceil(filtered.length/5)}; }
  return {ok:code<400,status:code,json:async()=>value};
 }));
});
describe('application workflows' , () => {
  it('adds, edits, searches and deletes a computer', async () => {
    const user = userEvent.setup(); render(<App/>);
    await user.click(screen.getByRole('button',{name:/Add computer/}));
    for (const [label,value] of [['Asset ID *','PC-100'],['Computer name *','Test machine'],['Brand *','Dell'],['Location *','Lab']]) await user.type(screen.getByLabelText(label),value);
    await user.click(screen.getByRole('button',{name:'Save computer'}));
    await user.type(screen.getByRole('textbox',{name:'Search computers'}),'Test machine');
    expect(await screen.findByText('Test machine')).toBeInTheDocument();
    await user.click(screen.getByRole('button',{name:'Edit PC-100'}));
    await user.clear(screen.getByLabelText('Computer name *')); await user.type(screen.getByLabelText('Computer name *'),'Updated machine');
    await user.click(screen.getByRole('button',{name:'Save computer'}));
    await user.clear(screen.getByRole('textbox',{name:'Search computers'})); await user.type(screen.getByRole('textbox',{name:'Search computers'}),'updated');
    expect(await screen.findByText('Updated machine')).toBeInTheDocument(); expect(screen.queryByText('Mac mini')).not.toBeInTheDocument();
    await user.click(screen.getByRole('button',{name:'Delete PC-100'})); await user.click(screen.getByRole('button',{name:'Confirm delete'}));
    await waitFor(()=>expect(screen.queryByText('Updated machine')).not.toBeInTheDocument()); expect(screen.getByText('No computers found')).toBeInTheDocument();
  });
  it('cancels deletion and filters the collection', async () => {
    const user=userEvent.setup(); render(<App/>); await screen.findByText('MacBook Pro 14');
    await user.click(screen.getByRole('button',{name:'Delete PC-001'})); await user.click(screen.getByRole('button',{name:'Keep computer'}));
    expect(screen.getByText('MacBook Pro 14')).toBeInTheDocument();
    await user.selectOptions(screen.getByRole('combobox',{name:'Filter by status'}),'Maintenance');
    expect(await screen.findByText('EliteBook 840')).toBeInTheDocument(); await waitFor(()=>expect(screen.queryByText('Mac mini')).not.toBeInTheDocument());
  });
  it('provides navigation and project information', async () => {
    const user=userEvent.setup();render(<App/>);await user.click(screen.getByRole('button',{name:/About/}));
    expect(screen.getByRole('heading',{name:'About this project'})).toBeInTheDocument();expect(screen.getByText(/persistent H2/)).toBeInTheDocument();
    await user.click(within(screen.getByRole('navigation')).getByRole('button',{name:/Computers/}));expect(screen.getByRole('heading',{name:'Computer inventory'})).toBeInTheDocument();
  });
});

it('finds a computer by ID through the API', async()=>{
 const user=userEvent.setup();render(<App/>);
 await user.type(screen.getByRole('textbox',{name:'Find by asset ID'}),'PC-001');
 await user.click(screen.getByRole('button',{name:'Find computer'}));
 expect(await screen.findByRole('heading',{name:'Edit computer'})).toBeInTheDocument();
 expect(screen.getByLabelText('Asset ID *')).toBeDisabled();
 expect(fetch).toHaveBeenCalledWith('/api/assets/PC-001',expect.any(Object));
});
it('shows API failures and supports retry', async()=>{
 fetch.mockRejectedValueOnce(new Error('Server unavailable'));
 const user=userEvent.setup();render(<App/>);
 expect(await screen.findByRole('alert')).toHaveTextContent('Server unavailable');
 await user.click(screen.getByRole('button',{name:'Retry'}));
 expect(await screen.findByText('MacBook Pro 14')).toBeInTheDocument();
});
it('requests the next server page', async()=>{
 rows.push({...seedAssets[0],id:'PC-006',name:'Sixth computer'});
 const user=userEvent.setup();render(<App/>);
 await screen.findByText('MacBook Pro 14');
 await user.click(screen.getByRole('button',{name:'Next'}));
 expect(await screen.findByText('Sixth computer')).toBeInTheDocument();
 expect(screen.queryByText('MacBook Pro 14')).not.toBeInTheDocument();
});
