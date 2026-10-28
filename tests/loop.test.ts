import test from 'node:test';
import assert from 'node:assert/strict';
import {loopBounds,trackPosition} from '../src/track-loop';

test('four-beat loop repeats the same two-second region at 120 BPM',()=>{
 const {start,end}=loopBounds(5,20,4,120);
 assert.deepEqual({start,end},{start:5,end:7});
 assert.equal(trackPosition(5,1,1,20,start,end),6);
 assert.equal(trackPosition(5,5,1,20,start,end),6);
 assert.equal(trackPosition(6,1,1,20),7);
});

test('loop near the end keeps the full requested length; seek reanchors it',()=>{
 assert.deepEqual(loopBounds(19,20,8,120),{start:16,end:20});
 assert.equal(trackPosition(19,2,1,20,16,20),17);
 assert.deepEqual(loopBounds(8,20,8,120),{start:8,end:12});
});
