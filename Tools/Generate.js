#!/usr/bin/env -S deno run --allow-read=../ --allow-write=../


import { dirname , fromFileUrl , join } from 'https://deno.land/std/path/mod.ts';
import { emptyDir } from 'https://deno.land/std/fs/mod.ts';
import { parse } from 'https://deno.land/std/encoding/yaml.ts'

const { readTextFile , writeTextFile } = Deno;
const { log , clear } = console;

const root = join(dirname(fromFileUrl(import.meta.url)),'..');

const datafile = join(root,'Data','Repositories.yaml');
const listsfolder = join(root,'Lists');


clear();

await emptyDir(listsfolder);

const yaml = await readTextFile(datafile);

const repositories = parse(yaml);


const languages = new Map;

repositories.forEach((repository) => {
    repository.languages.forEach((language) => {
        const list = languages.get(language) ?? [];
        list.push(repository);
        languages.set(language,list);
    });
});


const languagefolder = join(listsfolder,'Languages');
await emptyDir(languagefolder);

for await (const [ language , repositories ] of languages.entries()){
    
    let markdown = '';
    
    repositories.forEach((repository) => {
        markdown += preview(repository);
    });
    
    const file = join(languagefolder,`${ language }.md`);
    
    await writeTextFile(file,markdown);
}


let languagelist = `

<div align = center>

# Languages

`;

for(const language of languages.keys())
    languagelist += `${ button(language,language) } <br>\n\n`;
    
for(const language of languages.keys())
    languagelist += `[${ language }]: Languages/${ encodeURIComponent(language) }.md \n`;

languagelist += `
</div>
`;

await writeTextFile(join(listsfolder,'Languages.md'),languagelist);


function preview(repository){
    
    return `
    [${ repository.name }]
    
        
    `;
}


function button(label,link){
    return `[<kbd> <br> ${ label } <br> </kbd>][${ link }]`;
}


