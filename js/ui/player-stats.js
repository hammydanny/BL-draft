// Shared six-axis player evaluation. OVR and GK stay separate from the radar.
const PLAYER_RADAR_AXES = [
    {key:"spd",label:"SPD",name:"Speed"},
    {key:"def",label:"DEF",name:"Defence"},
    {key:"pas",label:"PAS",name:"Passing"},
    {key:"dri",label:"DRI",name:"Dribbling"},
    {key:"sho",label:"SHO",name:"Shooting"},
    {key:"off",label:"OFF",name:"Offence"}
];

// Shared display-only grade; numerical ratings remain the source of truth.
function playerStatGrade(value){
    return value>=90?"S":value>=80?"A":value>=70?"B":value>=60?"C":
        value>=50?"D":value>=40?"E":value>=30?"F":"G";
}

function playerStatsRadar(player,variant="sidebar",{overall=null,position=""}={}){
    const stats=playerStats(player);
    const size=["auction","lore","sidebar"].includes(variant)?variant:"sidebar";
    const goalkeeper=playerPositions(player).includes("GK");
    // Fixed clockwise geometry: SPD, DEF, PAS, DRI, SHO, OFF.
    const point=(index,radius)=>{
        const angle=(-90+index*60)*Math.PI/180;
        return [150+Math.cos(angle)*radius,140+Math.sin(angle)*radius];
    };
    const coordinate=xy=>xy.map(value=>value.toFixed(2)).join(",");
    const hex=radius=>PLAYER_RADAR_AXES.map((_,i)=>coordinate(point(i,radius))).join(" ");
    const polygon=PLAYER_RADAR_AXES.map((axis,i)=>
        coordinate(point(i,Math.max(0,Math.min(100,Number(stats[axis.key])||0))*.88))
    ).join(" ");
    const description=PLAYER_RADAR_AXES.map(axis=>`${axis.name}: ${stats[axis.key]} out of 100, grade ${playerStatGrade(stats[axis.key])}`).join(". ");
    return `<div class="player-stats player-stats--${size}">
      <div class="player-stats-heading${overall===null?"":" player-stats-heading--rated"}">${overall===null?
        `<span>ATTRIBUTE ANALYSIS</span><small>${player.statEstimate?"GAME ESTIMATES":"06 // FIELD METRICS"}</small>`:
        `<div class="player-stats-title"><span>ATTRIBUTE ANALYSIS</span><small>${player.statEstimate?"GAME ESTIMATES":"06 // FIELD METRICS"}</small></div>
        <div class="player-stats-overall" aria-label="${esc(position)} overall rating ${overall}, grade ${playerStatGrade(overall)}"><span>OVR${position?` // ${esc(position)}`:""}</span><strong>${overall}</strong><b class="evaluation-grade">${playerStatGrade(overall)}</b></div>`}</div>
      <svg class="player-stats-radar" viewBox="0 0 300 280" role="img" aria-label="${esc(player.name)} attributes. ${esc(description)}">
        <title>${esc(player.name)} // six field attributes</title>
        <desc>${esc(description)}. Goalkeeping is shown separately.</desc>
        <polygon class="player-stats-backdrop" points="${hex(88)}"/>
        ${[.25,.5,.75,1].map(scale=>`<polygon class="player-stats-grid" points="${hex(88*scale)}"/>`).join("")}
        ${PLAYER_RADAR_AXES.map((_,i)=>`<line class="player-stats-spoke" x1="150" y1="140" x2="${point(i,88)[0].toFixed(2)}" y2="${point(i,88)[1].toFixed(2)}"/>`).join("")}
        <polygon class="player-stats-shape" points="${polygon}"/>
        ${PLAYER_RADAR_AXES.map((axis,i)=>{
            const [x,y]=point(i,122);
            return `<text class="player-stats-axis" x="${x.toFixed(2)}" y="${(y-6).toFixed(2)}" text-anchor="middle">${axis.label}</text>
              <text class="player-stats-value" x="${x.toFixed(2)}" y="${(y+14).toFixed(2)}" text-anchor="middle"><tspan>${stats[axis.key]}</tspan><tspan class="player-stats-axis-grade" dx="4">${playerStatGrade(stats[axis.key])}</tspan></text>`;
        }).join("")}
      </svg>
      <div class="player-stats-gk ${goalkeeper?"is-specialist":"is-outfield"}" aria-label="${goalkeeper?"Goalkeeper specialist":"Goalkeeping"}: ${stats.gk} out of 100, grade ${playerStatGrade(stats.gk)}">
        <span>${goalkeeper?"GOALKEEPER":"GOALKEEPING"}<small>${goalkeeper?"SPECIALIST METRIC":"SECONDARY METRIC"}</small></span>
        <strong><small>GK</small> ${stats.gk}</strong><b class="player-stats-grade">${playerStatGrade(stats.gk)}</b>
      </div>
    </div>`;
}
