import { ControlProps } from 'interfaces/nasaExplorer.interface';
import React from 'react';


export default function NeoControls(props: ControlProps) {
  const {
    start, end, hazardousOnly, animate,
    onStart, onEnd, onHazardousOnly, onAnimate,
    
  } = props;

  return (
    <>
      <div className="actions wrap" style={{ justifyContent: 'space-between', margin: '8px 0 6px' }}>
        <label className="field">Start
          <input className="input" type="date" value={start} onChange={e => onStart(e.target.value)} />
        </label>
        <label className="field">End
          <input className="input" type="date" value={end} onChange={e => onEnd(e.target.value)} />
        </label>

        <label className="row sub">
          <input type="checkbox" checked={hazardousOnly} onChange={e => onHazardousOnly(e.target.checked)} />
          <span className="muted sub">Hazardous</span>
        </label>

        <label className="row sub">
          <input type="checkbox" checked={animate} onChange={e => onAnimate(e.target.checked)} />
          <span className="sub">Animate</span>
        </label>
      </div>

      {/* <div className="actions wrap" style={{ justifyContent: 'space-between', margin: '8px 0 6px' }}>
        <div className="sub">
          <button className="btn margin-right-5" onClick={onZoomOut}>−</button>
          <button className="btn margin-right-5" onClick={onResetView}>Reset</button>
          <button className="btn margin-right-5" onClick={onZoomIn}>+</button>
        </div>
      </div> */}
    </>
  );
}
