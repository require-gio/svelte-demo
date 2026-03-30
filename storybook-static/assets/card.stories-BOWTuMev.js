import{p as F,z as f,n as h,j as t,q as s,k as j,o as r}from"./iframe-l5ZosE5p.js";import{c as k,d as q}from"./create-runtime-stories-CXn1hOhe.js";import{a as m,b as A,c as y,d as T,C as P,e as I,f as M}from"./card-action-CU_i3sms.js";import"./preload-helper-PPVm8Dsz.js";import"./this-BVpeF3LF.js";const U={title:"UI/Card",component:m,tags:["autodocs"]},{Story:g}=q();var B=r("<!> <!>",1),G=r("<p>Card content goes here. This is the main body of the card component.</p>"),J=r('<p class="text-sm text-muted-foreground">Card footer</p>'),K=r("<!> <!> <!>",1),L=r("<!> <!>",1),N=r("<p>Compact content area.</p>"),Q=r("<!> <!>",1),V=r('<button class="text-sm text-primary underline">Edit</button>'),X=r("<!> <!> <!>",1),Y=r("<p>Content with an action button in the header.</p>"),Z=r("<!> <!>",1),tt=r("<p>A simple card with only content, no header or footer.</p>"),rt=r("<!> <!> <!> <!>",1);function O(W,z){F(z,!0);var b=rt(),D=f(b);g(D,{name:"Default",children:(p,x)=>{m(p,{class:"w-80",children:(_,R)=>{var n=K(),d=f(n);A(d,{children:(i,a)=>{var e=B(),u=f(e);y(u,{children:(o,C)=>{var c=h("Card Title");t(o,c)},$$slots:{default:!0}});var v=s(u,2);T(v,{children:(o,C)=>{var c=h("Card description with helpful details.");t(o,c)},$$slots:{default:!0}}),t(i,e)},$$slots:{default:!0}});var $=s(d,2);P($,{children:(i,a)=>{var e=G();t(i,e)},$$slots:{default:!0}});var l=s($,2);I(l,{children:(i,a)=>{var e=J();t(i,e)},$$slots:{default:!0}}),t(_,n)},$$slots:{default:!0}})},$$slots:{default:!0},parameters:{__svelteCsf:{rawCode:`<CardRoot {...args}>
   <CardRoot class="w-80">
<CardHeader>
	<CardTitle>Card Title</CardTitle>
	<CardDescription>Card description with helpful details.</CardDescription>
</CardHeader>
<CardContent>
	<p>Card content goes here. This is the main body of the card component.</p>
</CardContent>
<CardFooter>
	<p class="text-sm text-muted-foreground">Card footer</p>
</CardFooter>
</CardRoot>
 </CardRoot>`}}});var S=s(D,2);g(S,{name:"Small",children:(p,x)=>{m(p,{class:"w-72",size:"sm",children:(_,R)=>{var n=Q(),d=f(n);A(d,{children:(l,i)=>{var a=L(),e=f(a);y(e,{children:(v,o)=>{var C=h("Small Card");t(v,C)},$$slots:{default:!0}});var u=s(e,2);T(u,{children:(v,o)=>{var C=h("A compact card variant.");t(v,C)},$$slots:{default:!0}}),t(l,a)},$$slots:{default:!0}});var $=s(d,2);P($,{children:(l,i)=>{var a=N();t(l,a)},$$slots:{default:!0}}),t(_,n)},$$slots:{default:!0}})},$$slots:{default:!0},parameters:{__svelteCsf:{rawCode:`<CardRoot {...args}>
   <CardRoot class="w-72" size="sm">
<CardHeader>
	<CardTitle>Small Card</CardTitle>
	<CardDescription>A compact card variant.</CardDescription>
</CardHeader>
<CardContent>
	<p>Compact content area.</p>
</CardContent>
</CardRoot>
 </CardRoot>`}}});var H=s(S,2);g(H,{name:"With Action",children:(p,x)=>{m(p,{class:"w-80",children:(_,R)=>{var n=Z(),d=f(n);A(d,{children:(l,i)=>{var a=X(),e=f(a);y(e,{children:(o,C)=>{var c=h("Card with Action");t(o,c)},$$slots:{default:!0}});var u=s(e,2);T(u,{children:(o,C)=>{var c=h("This card has a header action.");t(o,c)},$$slots:{default:!0}});var v=s(u,2);M(v,{children:(o,C)=>{var c=V();t(o,c)},$$slots:{default:!0}}),t(l,a)},$$slots:{default:!0}});var $=s(d,2);P($,{children:(l,i)=>{var a=Y();t(l,a)},$$slots:{default:!0}}),t(_,n)},$$slots:{default:!0}})},$$slots:{default:!0},parameters:{__svelteCsf:{rawCode:`<CardRoot {...args}>
   <CardRoot class="w-80">
<CardHeader>
	<CardTitle>Card with Action</CardTitle>
	<CardDescription>This card has a header action.</CardDescription>
	<CardAction>
		<button class="text-sm text-primary underline">Edit</button>
	</CardAction>
</CardHeader>
<CardContent>
	<p>Content with an action button in the header.</p>
</CardContent>
</CardRoot>
 </CardRoot>`}}});var E=s(H,2);g(E,{name:"Content Only",children:(p,x)=>{m(p,{class:"w-80",children:(_,R)=>{P(_,{class:"p-6",children:(n,d)=>{var $=tt();t(n,$)},$$slots:{default:!0}})},$$slots:{default:!0}})},$$slots:{default:!0},parameters:{__svelteCsf:{rawCode:`<CardRoot {...args}>
   <CardRoot class="w-80">
<CardContent class="p-6">
	<p>A simple card with only content, no header or footer.</p>
</CardContent>
</CardRoot>
 </CardRoot>`}}}),t(W,b),j()}O.__docgen={data:[],name:"card.stories.svelte"};const w=k(O,U),dt=["Default","Small","WithAction","ContentOnly"],lt={...w.Default,tags:["svelte-csf-v5"]},it={...w.Small,tags:["svelte-csf-v5"]},ct={...w.WithAction,tags:["svelte-csf-v5"]},$t={...w.ContentOnly,tags:["svelte-csf-v5"]};export{$t as ContentOnly,lt as Default,it as Small,ct as WithAction,dt as __namedExportsOrder,U as default};
