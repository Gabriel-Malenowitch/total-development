import { danger, fail, markdown } from 'danger'

type Topic =
    | '## 📙Description'
    | '## 🔬 Need test'
    | '## 🔬👨‍🔬 How to test'
    | '## 🎥 Feature prove'

if (!/(chore|docs|feat|fix|refactor|style|test|release)(\(\w+\))?:\s(\w|\s)+$/.test(danger.github.pr.title)) {
    fail('The title need to be in pattern `flag(context): description`')
}

const template = (danger.github.issue as { body?: string } & Record<string, any>).body

if (template) {
    const getNonEmptyLines = ({ title, nextTitle, template }: {
    title: Topic
    nextTitle?: Topic
    template: string
    }): Array<string> => {
        const titleRegExp = new RegExp(title)
        const nextTitleRegExp = nextTitle ? new RegExp(`${nextTitle}`) : undefined

        const titleIndex = titleRegExp.exec(template)?.index ?? 0
        const nextTitleIndex = nextTitleRegExp?.exec(template)?.index ?? template.length

        const scope: Array<string> = template
        .substring(titleIndex, nextTitleIndex)
        .split('\n')
        .filter((_, index) => index > 0)

        const validLines = scope.filter(line => /(\S{5,}|(n\/a)|(N\/A))/.test(line))

        return validLines
    }

    const getMarkedCheckListItems = (taskItems: Array<string>): Array<string> => {
        const checklistMarkedStructureRegex = /\s?-\s\[(x|X)\]\s/

        const checkListMarkedOptions: Array<string> = taskItems
        .map(taskItem => {
            const taskItemRegex = new RegExp(`${checklistMarkedStructureRegex.source}${taskItem}`)
            const lineMatch = taskItemRegex.exec(template)?.[0] ?? ''

            return lineMatch
        })
        .filter(Boolean)

        return checkListMarkedOptions
    }

    let hasAnyError = false

    {
        const validLines = getNonEmptyLines({
            title: '## 📙Description',
            nextTitle: '## 🔬 Need test',
            template,
        })
    
        if (!validLines.length) {
            hasAnyError = true
            fail('Missing topic "📙Description".')
        }
    }

    {
        const checkListMarkedOptions = getMarkedCheckListItems([
            'Yes and i did!',
            'No',
            'Yes but something happened...will be not in this PR!'
        ])

        if (!checkListMarkedOptions.length) {
            fail('Github template is missing topic "🔬 Need test".')
        }
    }

    {
        const validLines = getNonEmptyLines({
            title: '## 🔬👨‍🔬 How to test',
            nextTitle: '## 🎥 Feature prove',
            template,
        })
    
        if (!validLines.length) {
            hasAnyError = true
            fail('Missing topic "🔬👨‍🔬 How to test".')
        }
    }

    {
        const validLines = getNonEmptyLines({
            title: '## 🎥 Feature prove',
            template,
        })
    
        if (!validLines.length) {
            hasAnyError = true
            fail('Missing topic "🎥 Feature prove.')
        }
    }

    if (hasAnyError) {
        markdown('### If something should not be filled in, comment "n/a" in the topic.')
    }
} else {
    fail('Danger.js could not find the Github markdown template.')
}