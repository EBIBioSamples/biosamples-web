# README

This is the web interface for EBI BioSamples.

## Checkout

Note that this repository uses submodules. Therefore before using this repository 
they should also be checked out using the command `git submodule init` followed 
by `git submodule update`.

For more information on using submodules, see https://chrisjean.com/git-submodules-adding-using-removing-and-updating/ and similar web pages


## BioSolr

The code in the biosolr_annotator directory is taken from https://github.com/flaxsearch/BioSolr


## Maven
To improve maven performance, avoid using the "clean" target and enable mult-core processing of submodules similar to 
`mvn -T 1C package`

## Thanks
The BioSamples team would like to thank the following companies for their support through the offering of free software licenses:

[Atlassian](http://www.atlassian.com/) for [Bamboo](http://www.atlassian.com/software/bamboo/overview) - Continuous Integration and Release Management tool.

[BrowserStack](https://www.browserstack.com/) for providing the infrastructure that allows us to test our service in real browsers. [<img src="https://www.browserstack.com/images/mail/browserstack-logo-footer.png" width="120">](https://www.browserstack.com/)
