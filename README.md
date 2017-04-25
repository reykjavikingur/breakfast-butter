# Butter

Butter is a tool for building website UI toolkits.

## Quick Start

Globally install the Butter CLI:
```sh
npm install -g brkfst-butter-cli
```

Change directory to the folder where you want to install Butter:
```sh
cd /Development/Butter
```

Install Butter:
```sh
butter install
```

Launch Butter:
```sh
butter launch
```


## Atomic Thinking
Atomic design is a methodology composed of five distinct stages working together to create interface design systems in a more deliberate and hierarchical manner. 

### 5 Stages of Atomic Design
![atoms, molecules, organisms, templates, pages](http://daigofuji.github.io/abcd-digipub-2014/img/atomic-web-design.gif)

#### Atoms
Atoms serve as the foundational building blocks that comprise all our user interfaces. These atoms include basic HTML elements like form labels, inputs, buttons, and others that can’t be broken down any further without ceasing to be functional.

##### Creating an Atom
Run the Butter-CLI `create` command and follow the prompts.
```sh
butter create atom
```
Alternatively you can skip the prompts by specifying flags with the create command
```sh
butter create atom --name button-primary --group button --dna btn-primary --style button-primary
```
When the command executes three things will happen:
1. A new `~/src/materials/` file will be created: `button-primary.html` with some starter code. 
2. A new `~/src/views/` file will be created: `button.html` with code that adds your element group to the Butter menu.
3. A new `~/src/assets/toolkit/styles/themes/default/` file will be created: `_button-primary.scss` and included in your theme's `_style.scss`. 

> If any of the files already exist, they will be skipped.
> The theme in this case **default** can be changed by setting the butter config value for theme: `butter set --key theme --value "my-theme"`


