import{e as b,p as $,z as F,C as _,m as y,q as h,j as m,k as N,o as d,D as g,v as f,u as S}from"./iframe-l5ZosE5p.js";import{c as E,d as I}from"./create-runtime-stories-CXn1hOhe.js";import{D as K}from"./data-table-DdzRER2r.js";import"./preload-helper-PPVm8Dsz.js";import"./each-BfNgR5PF.js";import"./table-row-BZTLU-ik.js";import"./this-BVpeF3LF.js";function i(o,n){let c=b(n,"data",19,()=>[]),p=b(n,"columns",19,()=>[]),u=b(n,"enableSorting",3,!1),v=b(n,"globalFilter",3,"");K(o,{get data(){return c()},get columns(){return p()},get enableSorting(){return u()},get globalFilter(){return v()}})}i.__docgen={data:[{name:"data",visibility:"public",keywords:[],kind:"let",type:{kind:"type",type:"array",text:"Row[]"},static:!1,readonly:!1,defaultValue:"[]"},{name:"columns",visibility:"public",keywords:[],kind:"let",type:{kind:"type",type:"array",text:"ColumnDef<Row, unknown>[]"},static:!1,readonly:!1,defaultValue:"[]"},{name:"enableSorting",visibility:"public",keywords:[],kind:"let",type:{kind:"type",type:"boolean",text:"boolean"},static:!1,readonly:!1,defaultValue:"false"},{name:"globalFilter",visibility:"public",keywords:[],kind:"let",type:{kind:"type",type:"string",text:"string"},static:!1,readonly:!1,defaultValue:'""'}],name:"data-table-preview.svelte"};const R={title:"Components/DataTable",component:i,tags:["autodocs"]},{Story:w}=I(),D=[{accessorKey:"position",header:"#"},{accessorKey:"name",header:"Column Name"},{accessorKey:"type",header:"Data Type"},{id:"nullable",accessorFn:o=>o.nullable?"Yes":"No",header:"Nullable"},{accessorKey:"comment",header:"Description"}],C=[{position:1,name:"customer_id",type:"LONG",nullable:!1,comment:"Primary key"},{position:2,name:"first_name",type:"STRING",nullable:!1,comment:"Customer first name"},{position:3,name:"last_name",type:"STRING",nullable:!1,comment:"Customer last name"},{position:4,name:"email",type:"STRING",nullable:!0,comment:"Email address"},{position:5,name:"created_at",type:"TIMESTAMP",nullable:!0,comment:"Account creation date"},{position:6,name:"city",type:"STRING",nullable:!0,comment:"City of residence"},{position:7,name:"policy_count",type:"INT",nullable:!0,comment:"Number of active policies"}],k=[{accessorKey:"id",header:"ID"},{accessorKey:"name",header:"Name"},{accessorKey:"value",header:"Value"}],G=[{id:1,name:"Alpha",value:100},{id:2,name:"Beta",value:250},{id:3,name:"Gamma",value:75}];var V=d('<div class="max-w-3xl w-[48rem]"><!></div>'),A=d('<div class="max-w-3xl w-[48rem]"><!></div>'),M=d('<div class="w-96"><!></div>'),O=d('<div class="w-96"><!></div>'),j=d("<!> <!> <!> <!>",1);function x(o,n){$(n,!0);var c=j(),p=F(c);{const a=(l,s=_)=>{var e=V(),r=S(e);i(r,g(s)),m(l,e)};let t=f(()=>({data:C,columns:D,enableSorting:!0}));w(p,{name:"Schema Table (Sortable)",get args(){return y(t)},children:a,$$slots:{default:!0},parameters:{__svelteCsf:{rawCode:`<DataTablePreview {...args}>
   {#snippet children(args)}
<div class="max-w-3xl w-[48rem]">
	<DataTablePreview {...args} />
</div>
{/snippet}
 </DataTablePreview>`}}})}var u=h(p,2);{const a=(l,s=_)=>{var e=A(),r=S(e);i(r,g(s)),m(l,e)};let t=f(()=>({data:C,columns:D,enableSorting:!0,globalFilter:"name"}));w(u,{name:"Schema Table (Filtered)",get args(){return y(t)},children:a,$$slots:{default:!0},parameters:{__svelteCsf:{rawCode:`<DataTablePreview {...args}>
   {#snippet children(args)}
<div class="max-w-3xl w-[48rem]">
	<DataTablePreview {...args} />
</div>
{/snippet}
 </DataTablePreview>`}}})}var v=h(u,2);{const a=(l,s=_)=>{var e=M(),r=S(e);i(r,g(s)),m(l,e)};let t=f(()=>({data:G,columns:k}));w(v,{name:"Simple Table",get args(){return y(t)},children:a,$$slots:{default:!0},parameters:{__svelteCsf:{rawCode:`<DataTablePreview {...args}>
   {#snippet children(args)}
<div class="w-96">
	<DataTablePreview {...args} />
</div>
{/snippet}
 </DataTablePreview>`}}})}var P=h(v,2);{const a=(l,s=_)=>{var e=O(),r=S(e);i(r,g(s)),m(l,e)};let t=f(()=>({data:[],columns:k}));w(P,{name:"Empty State",get args(){return y(t)},children:a,$$slots:{default:!0},parameters:{__svelteCsf:{rawCode:`<DataTablePreview {...args}>
   {#snippet children(args)}
<div class="w-96">
	<DataTablePreview {...args} />
</div>
{/snippet}
 </DataTablePreview>`}}})}m(o,c),N()}x.__docgen={data:[],name:"data-table.stories.svelte"};const T=E(x,R),Q=["SchemaTableSortable","SchemaTableFiltered","SimpleTable","EmptyState"],U={...T.SchemaTableSortable,tags:["svelte-csf-v5"]},W={...T.SchemaTableFiltered,tags:["svelte-csf-v5"]},X={...T.SimpleTable,tags:["svelte-csf-v5"]},Z={...T.EmptyState,tags:["svelte-csf-v5"]};export{Z as EmptyState,W as SchemaTableFiltered,U as SchemaTableSortable,X as SimpleTable,Q as __namedExportsOrder,R as default};
