import React, { useState, useEffect } from 'react';
import { statuses, blankAsset, validateAsset } from './assets.js';

import { request } from './api.js';

function AssetForm({ assets, initial, onSave, onClose }) {
  const [form, setForm] = useState(initial || { ...blankAsset });
  const [error, setError] = useState('');
  async function submit(event) {
    event.preventDefault();
    const clean = Object.fromEntries(Object.entries(form).map(([key, value]) => [key, value.trim()]));
    const problem = validateAsset(clean, assets, initial?.id);
    if (problem) return setError(problem);
    try { await onSave(clean, initial?.id); } catch (error) { setError(error.message); }
  }
  return <section className="form-panel" aria-labelledby="form-title">
    <div className="section-heading"><div><span className="eyebrow">COMPUTER RECORD</span><h2 id="form-title">{initial ? 'Edit computer' : 'Add a computer'}</h2></div><button className="secondary" onClick={onClose}>Cancel</button></div>
    <form onSubmit={submit}><div className="form-grid">{[['id','Asset ID',true],['name','Computer name',true],['brand','Brand',true],['assignee','Assignee',false],['location','Location',true],['purchased','Purchase date',false]].map(([key,label,required]) => <label key={key}>{label}{required && ' *'}<input disabled={key === 'id' && !!initial} required={required} maxLength={120} type={key === 'purchased' ? 'date' : 'text'} value={form[key]} onChange={event => setForm({...form,[key]:event.target.value})}/></label>)}
    <label>Status<select value={form.status} onChange={event => setForm({...form,status:event.target.value})}>{statuses.map(status => <option key={status}>{status}</option>)}</select></label></div>
    {error && <p role="alert" className="error">{error}</p>}<div className="form-footer"><small>* Required fields</small><button className="primary" type="submit">Save computer</button></div></form>
  </section>;
}

export default function App() {
  const [assets, setAssets] = useState([]);
  const [page, setPage] = useState('Overview');
  const [query, setQuery] = useState('');
  const [status, setStatus] = useState('All');
  const [editing, setEditing] = useState(undefined);
  const [deleting, setDeleting] = useState(null);
  const [notice, setNotice] = useState('');
  const [number, setNumber] = useState(0);
  const [result, setResult] = useState({content:[],totalElements:0,totalPages:0});
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [revision, setRevision] = useState(0);
  const [lookup, setLookup] = useState('');
  useEffect(() => {
    let active = true; setLoading(true); setError('');
    request(`?page=${number}&size=5&query=${encodeURIComponent(query)}&status=${status}`)
      .then(data => { if(active) { if(number > 0 && number >= data.totalPages) setNumber(Math.max(0,data.totalPages-1)); else { setResult(data); setAssets(data.content); } } })
      .catch(e => { if(active) setError(e.message); }).finally(() => { if(active) setLoading(false); });
    return () => { active=false; };
  }, [number,query,status,revision]);
  const visible = result.content;
  async function findById(event) {
    event.preventDefault();
    try { const asset=await request('/'+encodeURIComponent(lookup.trim())); setEditing(asset); setError(''); }
    catch(e) { setError(e.message); }
  }
  function navigate(next) { setPage(next); setEditing(undefined); setDeleting(null); }
  async function save(asset, originalId) {
    await request(originalId ? '/'+encodeURIComponent(originalId) : '', {method:originalId?'PUT':'POST',body:JSON.stringify(asset)});
    setEditing(undefined); setNotice(originalId ? 'Computer updated.' : 'Computer added.'); setRevision(x=>x+1);
  }
  async function remove() {
    try { await request('/'+encodeURIComponent(deleting.id),{method:'DELETE'}); setDeleting(null); setEditing(undefined); setRevision(x=>x+1); setNotice('Computer deleted.'); }
    catch(e) { setError(e.message); }
  }
  return <div className="app"><aside><a className="logo" href="#" onClick={event => { event.preventDefault(); navigate('Overview'); }}><span className="logo-icon">▦</span> inventory<span className="logo-dot">.</span></a><div className="workspace">WORKSPACE<span>Company equipment</span></div><nav aria-label="Main menu">{['Overview','Computers','About'].map((item,index) => <button key={item} className={page === item ? 'nav active' : 'nav'} onClick={() => navigate(item)}><span aria-hidden="true">{['◫','▣','◎'][index]}</span>{item}{item === 'Computers' && <b>{result.totalElements}</b>}</button>)}</nav><div className="sidebar-bottom"><span className="avatar">SE</span><div>SE411 Project<small>Fall 2026–27 · Part 2</small></div></div></aside>
  <main><header><span>Workspace <span className="slash">/</span> {page}</span><span className="semester">● Computer inventory</span></header><div className="content"><div className="page-heading"><div><span className="eyebrow">YOUR EQUIPMENT, ORGANIZED</span><h1>{page === 'About' ? 'About this project' : page === 'Computers' ? 'Computer inventory' : 'Workspace overview'}</h1><p>{page === 'About' ? 'The people and purpose behind Inventory.' : 'Keep track of every computer, from assignment to retirement.'}</p></div>{page !== 'About' && <button className="primary" onClick={() => { setEditing(null); setDeleting(null); }}>＋ Add computer</button>}</div>
  {page === 'About' ? <><section className="about-intro"><span className="eyebrow">SE411 · FALL 2026–27</span><h2>A clearer view of company computers.</h2><p>Inventory is a React frontend for managing one asset category: computers. Add records, find equipment, update assignments, and remove retired entries.</p><p>React connects to a Spring Boot REST API. Computer records are stored in a persistent H2 database. Use the inventory to add, find, update, and delete computers.</p></section></> : <>
  <div className="stats">{[['Matching computers',result.totalElements,'Across matching pages','▣'],['Available',assets.filter(item => item.status === 'Available').length,'On this page','↗'],['Assigned',assets.filter(item => item.status === 'Assigned').length,'On this page','◎'],['Maintenance',assets.filter(item => item.status === 'Maintenance').length,'On this page','⚙']].map(([label,count,detail,icon]) => <article className="stat" key={label}><div>{label}<span>{icon}</span></div><strong>{count.toString().padStart(2,'0')}</strong><small>{detail}</small></article>)}</div>
  {editing !== undefined && <AssetForm key={editing?.id || 'new'} assets={assets} initial={editing} onSave={save} onClose={() => setEditing(undefined)}/>}
  {error && <p role="alert" className="error">{error} <button onClick={()=>setRevision(x=>x+1)}>Retry</button></p>}
  {loading && <p role="status">Loading computers…</p>}
  <form onSubmit={findById} className="toolbar"><label>Find by asset ID <input required value={lookup} onChange={e=>setLookup(e.target.value)} placeholder="PC-001" /></label><button className="secondary">Find computer</button></form>
  {notice && <p role="status" className="notice">✓ {notice}</p>}
  <section className="panel"><div className="section-heading"><div><h2>All computers <span className="count">{result.totalElements}</span></h2><p>A single place for your equipment records.</p></div><span className="collection">Server records</span></div><div className="toolbar"><label className="search"><span aria-hidden="true">⌕</span><input aria-label="Search computers" placeholder="Search by name, ID, assignee…" value={query} onChange={event => {setQuery(event.target.value);setNumber(0);}}/></label><select aria-label="Filter by status" value={status} onChange={event => {setStatus(event.target.value);setNumber(0);}}><option value="All">All statuses</option>{statuses.map(item => <option key={item}>{item}</option>)}</select></div>
  <div className="table-wrap"><table><thead><tr><th>COMPUTER</th><th>ASSET ID</th><th>ASSIGNEE / LOCATION</th><th>STATUS</th><th>PURCHASED</th><th>ACTIONS</th></tr></thead><tbody>{visible.map(asset => <tr key={asset.id}><td><div className="computer"><span className="computer-icon">▱</span><div><strong>{asset.name}</strong><small>{asset.brand}</small></div></div></td><td className="asset-id">{asset.id}</td><td><div>{asset.assignee || 'Unassigned'}<small>{asset.location}</small></div></td><td><span className={'badge '+asset.status.toLowerCase()}>● {asset.status}</span></td><td className="date">{asset.purchased || '—'}</td><td><div className="actions"><button aria-label={'Edit '+asset.id} onClick={() => { setEditing(asset); setDeleting(null); }}>Edit</button><button className="delete" aria-label={'Delete '+asset.id} onClick={() => setDeleting(asset)}>Delete</button></div></td></tr>)}</tbody></table>{!visible.length && <div className="empty"><h3>No computers found</h3><p>Try another search or add a computer.</p></div>}</div><div className="table-footer">Showing {visible.length} of {result.totalElements} computers<span><button disabled={loading || number===0} onClick={()=>setNumber(x=>x-1)}>Previous</button> Page {result.totalPages ? number+1 : 0} of {result.totalPages} <button disabled={loading || number+1>=result.totalPages} onClick={()=>setNumber(x=>x+1)}>Next</button></span></div></section>
  {deleting && <section className="delete-confirm" role="alertdialog" aria-label="Confirm deletion"><div><strong>Delete {deleting.name} ({deleting.id})?</strong><p>This removes the record from the current collection.</p></div><button className="secondary" onClick={() => setDeleting(null)}>Keep computer</button><button className="danger" onClick={remove}>Confirm delete</button></section>}
  <div className="bottom-note"><span>◇</span><p><strong>Built for a simpler workflow.</strong> Manage company computers without the spreadsheet.</p></div></>}
  <footer>Inventory · SE411 <span>React · Spring Boot · H2</span></footer></div></main></div>;
}
