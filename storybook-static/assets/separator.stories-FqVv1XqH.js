import{p as g,z as h,q as a,u as p,j as r,k as S,o as n}from"./iframe-l5ZosE5p.js";import{c as $,d as w}from"./create-runtime-stories-CXn1hOhe.js";import{S as s}from"./separator-BwpPbxOd.js";import"./preload-helper-PPVm8Dsz.js";import"./create-id-DFeW3Vwh.js";const C={title:"UI/Separator",component:s,tags:["autodocs"]},{Story:c}=w();var b=n('<div class="w-80"><div class="space-y-1"><h4 class="text-sm font-medium leading-none">Content Above</h4> <p class="text-sm text-muted-foreground">Description text above the separator.</p></div> <!> <div class="space-y-1"><h4 class="text-sm font-medium leading-none">Content Below</h4> <p class="text-sm text-muted-foreground">Description text below the separator.</p></div></div>'),y=n('<div class="flex h-5 items-center gap-4 text-sm"><span>Blog</span> <!> <span>Docs</span> <!> <span>Source</span></div>'),z=n("<!> <!>",1);function d(v,_){g(_,!0);var i=z(),l=h(i);c(l,{name:"Horizontal",children:(o,u)=>{var t=b(),e=a(p(t),2);s(e,{class:"my-4"}),r(o,t)},$$slots:{default:!0},parameters:{__svelteCsf:{rawCode:`<Separator {...args}>
   <div class="w-80">
<div class="space-y-1">
	<h4 class="text-sm font-medium leading-none">Content Above</h4>
	<p class="text-sm text-muted-foreground">Description text above the separator.</p>
</div>
<Separator class="my-4" />
<div class="space-y-1">
	<h4 class="text-sm font-medium leading-none">Content Below</h4>
	<p class="text-sm text-muted-foreground">Description text below the separator.</p>
</div>
</div>
 </Separator>`}}});var f=a(l,2);c(f,{name:"Vertical",children:(o,u)=>{var t=y(),e=a(p(t),2);s(e,{orientation:"vertical"});var x=a(e,4);s(x,{orientation:"vertical"}),r(o,t)},$$slots:{default:!0},parameters:{__svelteCsf:{rawCode:`<Separator {...args}>
   <div class="flex h-5 items-center gap-4 text-sm">
<span>Blog</span>
<Separator orientation="vertical" />
<span>Docs</span>
<Separator orientation="vertical" />
<span>Source</span>
</div>
 </Separator>`}}}),r(v,i),S()}d.__docgen={data:[],name:"separator.stories.svelte"};const m=$(d,C),P=["Horizontal","Vertical"],j={...m.Horizontal,tags:["svelte-csf-v5"]},k={...m.Vertical,tags:["svelte-csf-v5"]};export{j as Horizontal,k as Vertical,P as __namedExportsOrder,C as default};
